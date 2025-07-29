//  sistema di autenticazione a doppio token:
//  - Access Token: JWT a breve durata, inviato nell'header 'Authorization'
//  - Refresh Token: JWT a lunga durata, salvato nel database e gestito tramite un cookie httpOnly sicuro
const User = require('../models/user.model');
const RefreshToken = require('../models/refreshToken.model');
const jwt = require('jsonwebtoken');

const generateAndStoreTokens = async (user) => {
    // Definisco la durata del refresh token
    const refreshTokenDuration = process.env.JWT_REFRESH_EXPIRES_IN_DAYS || 7;
    const refreshTokenExpiresIn = `${refreshTokenDuration}d`;
    const refreshTokenLifeMs = refreshTokenDuration * 24 * 60 * 60 * 1000;

    // Crea l'access token che contiene l'ID dell'utente
    const accessToken = jwt.sign(
        { id: user._id },           // Payload
        process.env.JWT_SECRET,     // Chiave segreta per la firma
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' } // Scadenza settata su 15min
    );

    // Crea il refresh token
    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,     // chiave segreta diversa da JWT_SECRET
        { expiresIn: refreshTokenExpiresIn }
    );

    // Calcola la data di scadenza esatta per il salvataggio nel DB
    // Questo campo è essenziale per l'indice TTL (Time-To-Live) in MongoDB, che eliminerà automaticamente il token dal DB una volta scaduto
    const expires = new Date(Date.now() + refreshTokenLifeMs);

    // Salva il refresh token nel database
    await RefreshToken.create({
        token: refreshToken,
        user: user._id,
        expires: expires,
    });
    
    return { accessToken, refreshToken };
};

//Imposta il refresh token in un cookie httpOnly
const sendRefreshTokenCookie = (res, refreshToken) => {
    res.cookie('jwt', refreshToken, {
        httpOnly: true,                                         // Il cookie non è accessibile da JavaScript nel browser (previene attacchi XSS)
        secure: process.env.NODE_ENV === 'production',          // Invia il cookie solo su connessioni HTTPS in produzione
        sameSite: 'Strict',                                     // Il cookie viene inviato solo per le richieste provenienti dallo stesso sito (previene attacchi CSRF)
        maxAge: refreshTokenDuration * 24 * 60 * 60 * 1000      // La durata del cookie in millisecondi (deve corrispondere alla vita del token)
    });
};


//  Registra un nuovo utente ed effettua il login automatico
exports.signup = async (req, res) => {
    try {
        const {username, email, password} = req.body;

        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(400).json({ message: "Username già in uso!"});
        }

        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ message: "E-mail già in uso!"});
        }

        const newUser = new User ({ username, email, password});
        await newUser.save();       // La password viene hashata dal middleware pre-save in user.model

        // Se l'utente è stato creato, genera i token e imposta il cookie per il login automatico
        const { accessToken, refreshToken } = await generateAndStoreTokens(newUser);
        sendRefreshTokenCookie(res, refreshToken);

        // Migliora la sicurezza rimuovendo la password dall'oggetto utente prima di inviarlo nella risposta
        newUser.password = undefined;

        // Invia una risposta di successo con l'access token e i dati del nuovo utente
        res.status(201).json({
            message: "L'utente è stato registrato con successo!",
            accessToken,
            data: { user: newUser }
        });
    } catch (error) {
        // Gestisce errori di validazione
        if (error.name === 'ValidationError') 
            return res.status(400).json({ message: Object.values(error.errors).map(val => val.message).join('. ') });
        
        // Gestisce tutti gli altri errori
        console.error("Errore registrazione:", error);
        res.status(500).json({ message: "Errore del server durante la registrazione!" });
    }
};

//  Autentica un utente esistente e gli fornisce i token di accesso
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        //  Controlla che email e password siano state fornite
        if (!email || !password) return res.status(400).json({ message: "Email e password sono obbligatori!" });
        
        //  Cerca l'utente nel DB tramite email. Con .select('+password') forziamo l'inclusione della password nell'oggetto restituito, dato che per default è nascosta
        const user = await User.findOne({ email }).select('+password');

        // Se l'utente non esiste o la password è errata, invia un errore
        if (!user || !(await user.comparePassword(password, user.password))) {
            return res.status(401).json({ message: "Email o password non corretti!" });
        }

        // Se le credenziali sono corrette, genera i token e imposta il cookie
        const { accessToken, refreshToken } = await generateAndStoreTokens(user);
        sendRefreshTokenCookie(res, refreshToken);
        
        // Migliora la sicurezza rimuovendo la password dall'oggetto utente prima di inviarlo nella risposta
        user.password = undefined;

        // Invia la risposta di successo
        res.status(200).json({
            message: "L'utente è stato loggato con successo!",
            accessToken,
            data: { user }
        });

    } catch (error) {
        console.error("Errore login:", error);
        res.status(500).json({ message: "Errore del server durante il login!" });
    }
};

//  Middleware per proteggere le routes che verifica la validità dell'access token
exports.protect = (req, res, next) => {
    let token;

    // Estrai il token dall'header 'Authorization' con formato atteso "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];    // Divide la stringa in base a ' ' e prende il secondo elemento (indice 1) che sarebbe il token
    }

    // Se non c'è un token, l'utente non è autorizzato.
    if (!token) {
        return res.status(401).json({ message: 'Non sei loggato. Effettua il login per ottenere l\'accesso.' });
    }

    // Verifica il token usando la sintassi con callback
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {         //  'decoded' contiene il payload 

        if (err) {
            return res.status(401).json({ message: 'Token non valido o scaduto.' });
        }
        
        try {
            const currentUser = await User.findById(decoded.id);

            if (!currentUser) {
                return res.status(401).json({ message: 'L\'utente a cui appartiene questo token non esiste più.' });
            }
            
            // Se tutto va a buon fine, allega l'oggetto utente alla richiesta (`req`). In questo modo, le routes successive protette avranno accesso a `req.user`
            req.user = currentUser;
            next();

        } catch (dbError) {
            return res.status(500).json({ message: 'Errore del server durante la verifica dell\'utente.' });
        }
    });
};

// Genera un nuovo access token utilizzando un refresh token valido.
exports.refreshToken = async (req, res) => {
    try {
        // Estrae il refresh token dal cookie httpOnly
        const refreshTokenFromCookie = req.cookies.jwt;
        if (!refreshTokenFromCookie) return res.status(401).json({ message: "Refresh token mancante." });

        // Cerca il token nel database. Questo è un controllo di sicurezza: se non è nel DB, significa che è stato invalidato 
        const foundToken = await RefreshToken.findOne({ token: refreshTokenFromCookie });
        if (!foundToken) return res.status(403).json({ message: "Refresh token non valido o revocato." });

        // Verifica il refresh token con una callback
        jwt.verify(refreshTokenFromCookie, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Refresh token non valido o scaduto." });
            }

            // Controllo di sicurezza aggiuntivo: l'ID utente nel token deve corrispondere all'ID utente associato al token nel database
            if (foundToken.user.toString() !== decoded.id) {
                return res.status(403).json({ message: "Refresh token compromesso." });
            }
            
            // 4. Se tutto è valido, genera un NUOVO access token
            const newAccessToken = jwt.sign(
                { id: decoded.id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
            );

            // 5. Invia il nuovo access token al client
            res.status(200).json({ status: 'success', accessToken: newAccessToken });
        });

    } catch (error) {
        // Questo `catch` gestisce errori avvenuti prima della callback (es. la query al DB)
        console.error("Errore refresh token:", error);
        res.status(500).json({ status: 'error', message: 'Errore del server.' });
    }
};

//  Effettua il logout dell'utente
exports.logout = async (req, res) => {
    try {
        // Prende il refresh token dal cookie.
        const refreshTokenFromCookie = req.cookies.jwt;
        if (refreshTokenFromCookie) {
            // Se esiste, lo elimina dal database. Questo lo invalida immediatamente, impedendo che possa essere usato per generare nuovi access token
            await RefreshToken.deleteOne({ token: refreshTokenFromCookie });
        }

        // Pulisce il cookie dal browser
        res.clearCookie('jwt', { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'Strict' }
        );
        
        // Invia una risposta di successo
        res.status(200).json({ message: "Logout effettuato con successo!" });
    } catch (error) {
        console.error("Errore logout:", error);
        res.status(500).json({ message: "Errore del server durante il logout." });
    }
};
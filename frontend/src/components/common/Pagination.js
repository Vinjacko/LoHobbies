import './Pagination.css';

const Pagination = ({ page, totalPages, setPage }) => {
  const handlePrev = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div className="pagination">
      <button onClick={handlePrev} disabled={page === 1}>
        {'<'}
      </button>
      <span>{page}</span>
      <button onClick={handleNext} disabled={page === totalPages}>
        {'>'}
      </button>
    </div>
  );
};

export default Pagination;
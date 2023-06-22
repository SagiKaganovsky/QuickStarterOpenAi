const Loader = ({ className }) => {
  return (
    <img
      src="images/loading.svg"
      className={`loading ${className}`}
      id="loading"
    />
  );
};

export default Loader;

import "./Loader.css"; // Correct path to your CSS file

const Loading = () => {
  return (
    <>
      <div className="loader-container">
        <div className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </>
  );
};

export default Loading;

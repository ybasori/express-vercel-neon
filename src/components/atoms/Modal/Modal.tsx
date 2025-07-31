import { IModal } from "./Modal.type";

const Modal:React.FC<IModal> = ({ title, children, onClose, isStaticBackdrop }) => {
  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={()=> !isStaticBackdrop ? onClose() : null}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title m-0">{title}</p>
          <button
            className="delete"
            aria-label="close"
            onClick={() => onClose()}
          ></button>
        </header>
        <section
          className="modal-card-body"
          style={{
            borderBottomLeftRadius: "0.75rem",
            borderBottomRightRadius: "0.75rem",
          }}
        >
          {children}
        </section>
      </div>
    </div>
  );
};

export default Modal;

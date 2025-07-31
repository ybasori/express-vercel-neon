import { update } from "@src/_states/reducers/notif/notif.slice";
import { AppDispatch } from "@src/_states/store";
import { RootState } from "@src/_states/types";
import { useDispatch, useSelector } from "react-redux";

const Notif: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const notif = useSelector((state:RootState)=>(state.notif));
  const dispatch = useDispatch<AppDispatch>();

  return (
    <>
      {children}
      <div style={{position: "fixed", bottom: 16, right: 16, minWidth: 270}}>
      {notif.notifications.map(
        (item: { id: string; title: string; text: string; hide: boolean }, key:number) => (
          <div className={`message ${item.hide ? "is-hidden" : ""}`} key={key}>
            <div className="message-header">
              {(!!item.title&&item.title!==""?item.title:"Info")}
              <button
                className="delete"
                type="button"
                onClick={() => dispatch(update({ ...item, hide: true }))}
              ></button>
            </div>
            <div className="message-body">{item.text}</div>
          </div>
        )
      )}
      </div>
    </>
  );
};

export default Notif;

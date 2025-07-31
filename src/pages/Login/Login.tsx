import { useState } from "react";
import { notify } from "@src/_states/reducers/notif/notif.thunk";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@src/_states/store";
import { login } from "@src/_states/reducers/auth/auth.slice";
import { useHistory } from "react-router-dom";

const Login = () => {
    // const {auth} = useSelector();
    const history = useHistory();
    const dispatch = useDispatch<AppDispatch>();
    const [form, setForm] = useState({
        username:"",
        password:""
    })
    return (<>
        <form className="box" onSubmit={(e)=>{
            e.preventDefault();

            fetch("/api/login",{
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
              })
              .then(res => {
                    return res.json();
                })
              .then(data => {
                    dispatch(notify({title:"", text:data.message, timer:5000}))
                if(data.statusCode === 200){
                    dispatch(login(data.result));
                    history.push("/")

                }
              })
              .catch(error => {
                console.error('Error:', error);
              });
        }}>

            <div className="field">
                <label className="label">Username</label>
                <div className="control">
                    <input className="input" type="text" placeholder="Username" name={"username"} value={form.username} onChange={(e)=>setForm({...form, [e.currentTarget.name]:e.currentTarget.value})} />
                </div>
            </div>

            <div className="field">
                <label className="label">Password</label>
                <div className="control">
                    <input className="input" type="password" placeholder="Password" name={"password"} value={form.password} onChange={(e)=>setForm({...form, [e.currentTarget.name]:e.currentTarget.value})} />
                </div>
            </div>


            <div className="field is-grouped">
                <div className="control">
                    <button className="button is-link" type={"submit"}>Login</button>
                </div>
            </div>
        </form>
    </>)
}

export default Login
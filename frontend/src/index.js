import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link , Redirect} from 'react-router-dom';
import axios from 'axios'
import './index.css';
import './bootstrap.css'
import * as serviceWorker from './serviceWorker';
const SERVERIP = "localhost"

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {  }
  }
  render() { 
    return ( 
      <Router>
        <Route path="/dash" exact component={DashPage} />
        <Route path="/login" exact component={LoginPage} />
        <Route path="/signup" exact component ={SignupPage} />
        <Route path="/" exact component={StartPage} />
      </Router>
     );
  }
}
 
class StartPage extends Component {
  constructor(props) {
    super(props);
    this.state = {  }
  }
  render() { 
    return ( <div className="row mt-5">
    <div className="col-md-6 m-auto">
        <div className="card card-body text-center">
            <h1><i className="fab fa-react fa-2x"></i> <i className="fas fa-plus"></i> <i className="fab fa-node-js fa-2x"></i></h1>
            <p>Create an account or login</p>
            <Link to="/signup" className="btn btn-primary btn-block mb-2">signup</Link>
            <Link to="/login" className="btn btn-secondary btn-block">login</Link>
        </div>
    </div>
</div> );
  }
}
class DashPage extends Component {
  constructor(props) {
    super(props);
    this.state = { redirect:false, user:"" }
  }
  componentDidMount() {
    // checks if the user is signed in  if not it will redirect
    if (!JSON.parse(window.sessionStorage.getItem('user'))) {
      this.setState({redirect:true})
    }
    else{
      this.setState({user:JSON.parse(window.sessionStorage.getItem('user'))})
    }
  }
  // http logout  and removes 'user' from the window session
  handleSubmit = (e) => {
    e.preventDefault()
    console.log("hello")
    axios.get(`http://${SERVERIP}:5000/users/logout`)
    .then((response) => {
      console.log(response)
      window.sessionStorage.removeItem('user');
      this.setState({redirect:true})
    })
  }
  renderRedirect()  { // will redirect user to the login page if the user isnt signed in 
    if (this.state.redirect) {
      return <Redirect to={{pathname: "/login",state: { referrer: "error" }}} />
    }
    else {
    return <h1>{this.state.user}</h1> 
    }
  }
  render() { 
    return (
      <div className="row mt-5">
        <div className="col-md-6 m-auto">
          <div className="card card-body">
            <h1 className="text-center mb-3"><i className="fas fa-hand-spock"></i>Hello</h1>
              <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                  {this.renderRedirect()}
                  <button type="submit" className="btn btn-primary btn-block">Logout</button>
                </div>
              </form>
            </div>
          </div>
       </div> 
    )
  }
}
 
class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = { email:'' ,password:'' , errors:[], redirect:false}
  }
  componentDidMount() {
    try {
      // this throws an error after user trys to go to the dash board without being signed in 
      if(this.props.location.state.referrer) {
        let list_of_errors = this.state.errors
        list_of_errors.push("You need to login to use that feature")
        this.setState({errors:list_of_errors})
      }
    }catch {
      console.log(null)
    }
  }
  onTextChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };
  // makes a post request with the states usename and password 
  // if succuss it will redirect user to dashboard
  handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`http://${SERVERIP}:5000/users/login`, {email:this.state.email, password: this.state.password})
    .then((response) => {
      try { //sets the session to the new user
        window.sessionStorage.setItem('user', JSON.stringify(response.data.name));
        this.setState({redirect:true})
      }catch {
        console.log("failed to set user")
      }
    })
    .catch(() => { // copies current errors then adds to them with the new errors
      let list_of_errors = this.state.errors // then sets current state to the new list of errors
      list_of_errors.push("Incorret password")
      this.setState({errors:list_of_errors})
    })
  }
  renderErrors() { // throws the dissmisable errpr messages
      return this.state.errors.map((i, idx) =>{ 
        return (<ThowError message={i} key={idx}/>)
    }) 
  }
  renderRedirect()  { //once loged in it will redirect to dash (if the state is set to true)
    if (this.state.redirect) {
      return <Redirect to={{pathname: "/dash"}} />
    }
  }
  render() { 
    return (  
    <div className="row mt-5">
      {this.renderRedirect()}
      <div className="col-md-6 m-auto">
        <div className="card card-body">
          <h1 className="text-center mb-3"><i className="fas fa-sign-in-alt"></i>Login</h1>
            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                {this.renderErrors()}
                <label htmlFor="email">Email</label>
                <input type="email" onChange={e => this.onTextChange(e)} value={this.state.email} id="email" name="email" className="form-control" placeholder="Enter Email"/>
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password"   onChange={e => this.onTextChange(e)} value={this.state.password}  id="password" name="password" className="form-control" placeholder="Enter Password" />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Login</button>
            </form>
            <p className="lead mt-4">Dont have an account? <Link to="/signup">Signup </Link></p>
          </div>
        </div>
      </div>  
    );
  }
}
 
class SignupPage extends Component {
  constructor(props) {
    super(props);
    this.state = { name:"", email:"", password:"", password2:"", errors:[], redirect:false }
  }
  onTextChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };
  // sends a http post request to /user/signup the state values are used as the new user
  handleSubmit = (e) => {
    e.preventDefault()
    axios.post(`http://${SERVERIP}:5000/users/signup`, {name:this.state.name,email:this.state.email, password: this.state.password, password2:this.state.password2})
    .then((response) => {
      if (response.data.errors) {
        let errors = this.state.errors //copies the current list of errors
        response.data.errors.map(({msg}) => { // then pushes the new error to the list 
          errors.push(msg)
        })
        this.setState({errors}) // sets the state to the new list of errors
      }else {
        try {
          // if everything went will it will try to set the session storage the users name
          window.sessionStorage.setItem('user', JSON.stringify(response.data.userdata.name)); 
          this.setState({redirect:true})
        }catch {
          console.log("error")
        }
      } 
    })
    .catch((err) => {
      console.log(err)
    })
  }
  renderErrors() { //maps all of the errors in the error state array and makes a dismissable notifaction 
    return this.state.errors.map((i,index) =>{ 
      return (<ThowError message={i} key={index}/>)
    }) 
  }
  renderRedirect()  { //once the new user is created it will automatically redirect the user to the dash board page
    if (this.state.redirect) {
      return <Redirect to={{pathname: "/dash"}} />
    }
  }
  render() { 
    return ( 
    <div className="row mt-5">
      {this.renderRedirect()}
      <div className="col-md-6 m-auto">
        <div className="card card-body">
          <h1 className="text-center mb-3"><i className="fas fa-user-plus"></i> Signup</h1>
          <form onSubmit={this.handleSubmit}>
            <div className="form-group">
              {this.renderErrors()}
              <label htmlFor="name">Name</label>
              <input type="name" onChange={e => this.onTextChange(e)} value={this.state.name} id="name" name="name" className="form-control" placeholder="Enter Name" />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" onChange={e => this.onTextChange(e)} value={this.state.email} id="email" name="email" className="form-control" placeholder="Enter Email"/>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password"   onChange={e => this.onTextChange(e)} value={this.state.password}  id="password" name="password" className="form-control" placeholder="Enter Password" />
            </div>
            <div className="form-group">
              <label htmlFor="password2">Confirm Password</label>
              <input type="password"   onChange={e => this.onTextChange(e)} value={this.state.password2}  id="password2" name="password2" className="form-control" placeholder="Re-Enter Password" />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Signup</button>
          </form>
          <p className="lead mt-4">Have An Account? <Link to="/login">Login</Link></p>
        </div>
       </div>
      </div> 
    );
  }
}
 
// this component throws the disnissible error messages on the sign in page and signup pages
class ThowError extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this)
    this.state = { active: true }
  }
  handleClick() {
    this.setState({active:false})
  }
  render() { 
    return (   
    <div className={`alert alert-warning alert-dismissible fade show  ${this.state.active ? "" : "false"}`}>
      <strong>{this.props.message}</strong>
      <button type="button" className="close" onClick={this.handleClick} >
        <span >&times;</span>
      </button>
    </div>
);
  }
}
 

ReactDOM.render(
    <App />
  ,document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

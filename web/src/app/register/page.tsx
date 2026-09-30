import BrandLogo from "../../components/BrandLogo";
import Link from "next/link";

export default function RegisterPage(){
 return <main className="auth-page">
  <header className="auth-header">
   <BrandLogo/>
   <Link className="text-link" href="/">Back to V1 ↗</Link>
  </header>
  <section className="auth-grid">
   <div className="auth-copy">
    <p className="eyebrow">V1 ACCOUNT</p>
    <h1>Your journey starts here.</h1>
    <ul>
     <li>Tell us where you would like to go</li>
     <li>Receive thoughtful travel options</li>
     <li>Keep support close before and during the trip</li>
    </ul>
   </div>
   <form className="auth-form">
    <div>
     <label htmlFor="name">Full name</label>
     <input id="name" name="name" autoComplete="name" placeholder="Li Wei"/>
    </div>
    <div>
     <label htmlFor="email">Email</label>
     <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com"/>
    </div>
    <div>
     <label htmlFor="phone">Phone / WhatsApp / WeChat</label>
     <input id="phone" name="phone" autoComplete="tel" placeholder="+34 ..."/>
    </div>
    <div>
     <label htmlFor="password">Password</label>
     <input id="password" name="password" type="password" autoComplete="new-password" placeholder="Create a password"/>
    </div>
    <fieldset>
     <legend>Preferred language</legend>
     <label><input type="radio" name="locale" defaultChecked/> 中文</label>
     <label><input type="radio" name="locale"/> English</label>
     <label><input type="radio" name="locale"/> Español</label>
    </fieldset>
    <button className="button" type="button">Create account <span>↗</span></button>
   </form>
  </section>
 </main>;
}

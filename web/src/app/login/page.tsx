import BrandLogo from "../../components/BrandLogo";
import Link from "next/link";

export default function LoginPage(){
 return <main className="auth-page">
  <header className="auth-header">
   <BrandLogo/>
   <Link className="text-link" href="/">Back to V1 ↗</Link>
  </header>
  <section className="auth-grid compact-auth">
   <div className="auth-copy">
    <p className="eyebrow">V1 ACCOUNT</p>
    <h1>Welcome back.</h1>
    <ul>
     <li>Review your travel requests</li>
     <li>Follow quotes and payment status</li>
     <li>Keep trip support close</li>
    </ul>
   </div>
   <form className="auth-form">
    <div>
     <label htmlFor="email">Email</label>
     <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com"/>
    </div>
    <div>
     <label htmlFor="password">Password</label>
     <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Your password"/>
    </div>
    <button className="button" type="button">Sign in <span>↗</span></button>
    <Link className="text-link" href="/register">Create an account ↗</Link>
   </form>
  </section>
 </main>;
}

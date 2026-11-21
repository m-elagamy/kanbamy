import Hero from "./hero";
import Features from "./features";
import HowItWorks from "./how-it-works";
import Cta from "./cta";
import { ClientCtaSectionActions } from "./client-auth-cta";

export default function Landing() {
  return (
    <div className="container">
      <Hero />
      <HowItWorks />
      <Features />
      <Cta>
        <ClientCtaSectionActions />
      </Cta>
    </div>
  );
}

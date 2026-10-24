import Hero from "./hero";
import Features from "./features";
import HowItWorks from "./how-it-works";
import Cta from "./cta";

const Landing = ({ isSignedIn }: { isSignedIn: boolean }) => {
  return (
    <div className="container">
      <Hero isSignedIn={isSignedIn} />
      <HowItWorks />
      <Features />
      <Cta isSignedIn={isSignedIn} />
    </div>
  );
};

export default Landing;

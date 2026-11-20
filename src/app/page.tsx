import Landing from "@/components/landing";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";

const LandingPage = () => {
  return (
    <>
      <Header />
      <main className="grow overflow-x-clip">
        <Landing />
      </main>
      <Footer />
    </>
  );
};

export default LandingPage;

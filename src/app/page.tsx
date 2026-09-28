import Landing from "@/components/landing";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { measurePerformance } from "@/utils/measure-performance";

const LandingPage = async () => {
  return measurePerformance("landing.route", async () => {
    const user = await measurePerformance("landing.auth", () => currentUser());
    const authUser = user
      ? {
          fullName: user.fullName,
          firstName: user.firstName,
          imageUrl: user.imageUrl,
        }
      : null;

    return (
      <>
        <Header user={authUser} />
        <main className="grow overflow-x-clip">
          <Landing isSignedIn={Boolean(user)} />
        </main>
        <Footer />
      </>
    );
  });
};

export default LandingPage;
import { currentUser } from "@clerk/nextjs/server";

import { GetStartedLanding } from "./_components/get-started-landing";

// Mocked demo: every visit to / shows the Get Started landing.
// No completion flag, no session detection — sidebar is the user's voluntary exit.
export default function HomePage() {
  return <GetStartedLanding />;
}

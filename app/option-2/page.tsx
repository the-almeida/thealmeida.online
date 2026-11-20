import { Metadata } from "next";
import { HomePage } from "../components/home-page";

// Temporary comparison route for the timeline (option 2: planets).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function OptionTwo() {
  return <HomePage timeline="planets" />;
}

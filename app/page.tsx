import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { CenteredNavigation } from "./components/centeredNav";
import Particles from "./components/particles";
import { NameTrigger } from "./components/secrets/name-trigger";
import { SecretsLayer } from "./components/secrets/secrets-layer";
import { SecretsProvider } from "./components/secrets/secrets-context";

import { Timeline } from "./components/timeline/timeline";
import { experiences } from "./data/experience";

export default function Home() {
  const currentYear = new Date().getFullYear();
  const yearIStartedWorking = 2015;
  const yearsOfExperience = currentYear - yearIStartedWorking;
  return (
    <SecretsProvider>
    <div className="w-full overflow-x-hidden">
      <Particles
        className="fixed inset-0 -z-10 animate-fade-in"
        quantity={200}
      />
      <section className="relative flex flex-col items-center justify-center w-full min-h-screen">
        {/* Hero gradient fades out at the bottom so it blends into the sections below */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-tl from-black via-zinc-600/20 to-black [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
        />
        <CenteredNavigation />

        <div className="hidden w-screen h-px animate-glow md:block animate-fade-left bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0 mb-3" />
        <NameTrigger text="theAlmeida" />
        <div className="hidden w-screen h-px animate-glow md:block animate-fade-right bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0 mt-3" />

        <div className="my-16 text-center animate-fade-in">
          <h2 className="text-md px-6 text-zinc-400 md:max-w-2xl md:text-xl xl:text-2xl">
            Hi, I'm Gustavo Almeida, a Software Engineer and Entrepreneur with
            around {yearsOfExperience} years of experience. I have built two
            successful companies, visually stunning websites, performant APIs,
            and smartwatch integrations. I specialize in JS/TS Stack but also
            have basic knowledge on GO, PHP and Python. Currently, I'm looking
            for new opportunities.{" "}
            <Link
              href="https://wa.link/dgb8r8"
              data-umami-event="hero_whatsapp_clicked"
              className="duration-200 text-zinc-400 border-b-2 border-zinc-400 hover:text-zinc-100"
            >
              Let's chat?
            </Link>
          </h2>
        </div>
        <a
          href="#experience"
          aria-label="Scroll to experience"
          className="absolute bottom-8 animate-fade-in text-zinc-500 hover:text-zinc-300 duration-500"
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </a>
      </section>
      <section
        id="experience"
        aria-labelledby="experience-title"
        className="w-full max-w-5xl px-6 py-24 mx-auto md:py-32"
      >
        <div className="mb-16 text-center md:mb-24">
          <h2 id="experience-title" className="text-4xl text-zinc-100 font-display md:text-6xl">
            Experience
          </h2>
          <p className="mt-4 text-zinc-400 md:text-lg">Ten years of shipping, oldest first.</p>
        </div>
        <Timeline items={experiences} />
      </section>
      <SecretsLayer />
    </div>
    </SecretsProvider>
  );
}

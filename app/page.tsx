import Link from "next/link";
import { CenteredNavigation } from "./components/centeredNav";
import Particles from "./components/particles";

export default function Home() {
  const currentYear = new Date().getFullYear();
  const yearsOfExperience = currentYear - 2015;
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gradient-to-tl from-black via-zinc-600/20 to-black">
      <CenteredNavigation />
      <Particles
        className="absolute inset-0 -z-10 animate-fade-in"
        quantity={200}
      />

      <div className="hidden w-screen h-px animate-glow md:block animate-fade-left bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0 mb-3" />
      <h1 className="z-10 text-4xl text-transparent duration-1000 bg-white cursor-default text-edge-outline animate-title font-display sm:text-6xl md:text-9xl whitespace-nowrap bg-clip-text ">
        theAlmeida
      </h1>
      <div className="hidden w-screen h-px animate-glow md:block animate-fade-right bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0 mt-3" />

      <div className="my-16 text-center animate-fade-in">
        <h2 className="text-md px-6 text-zinc-400 md:max-w-2xl md:text-xl xl:text-2xl">
          Hi, I'm Gustavo Almeida, a Software Engineer and Entrepreneur with
          around {yearsOfExperience} years of experience. I have built two
          successful companies, visually stunning websites, performant APIs, and
          smartwatch integrations. I specialize in JS/TS Stack but also have
          basic knowledge on GO, PHP and Python. Currently, I'm looking for new
          opportunities.{" "}
          <Link
            href="https://wa.link/dgb8r8"
            className="duration-200 text-zinc-400 border-b-2 border-zinc-400 hover:text-zinc-100"
          >
            Let's chat?
          </Link>
        </h2>
      </div>
    </div>
  );
}

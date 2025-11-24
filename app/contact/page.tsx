"use client";
import { Calendar, Mail } from "lucide-react";
import Link from "next/link";
import { ImWhatsapp } from "react-icons/im";
import { Card } from "../components/card";
import { FixedNavigation } from "../components/fixedNav";

const contacts = [
  {
    icon: <Calendar size={40} />,
    href: "https://calendly.com/the-almeida/introduction-call",
    title: "Book a 15-Minute Video Call",
    subTitle:
      "Let's connect face-to-face and chat. Schedule a time that works for you.",
  },
  {
    icon: <ImWhatsapp size={40} />,
    href: "https://wa.link/dgb8r8",
    title: "Quick Phone or Whatsapp Call",
    subTitle: "Call or message me and I'll get back to you shortly.",
  },
  {
    icon: <Mail size={40} />,
    href: "mailto:gustavo.s.p.almeida@gmail.com",
    title: "Send Me a Message",
    subTitle: "Send me an email, and I'll get back to you within a day.",
  },
];

export default function Contact() {
  return (
    <div className="bg-gradient-to-tl from-zinc-900/0 via-zinc-900 to-zinc-900/0">
      <FixedNavigation />
      <div className="container flex items-center justify-center min-h-screen px-4 mx-auto">
        <div className="grid w-full grid-cols-1 gap-8 mx-auto mt-32 sm:mt-0 sm:grid-cols-3 lg:gap-16 overflow-auto">
          {contacts.map((contact) => (
            <Card key={contact.title}>
              <Link
                href={contact.href}
                target="_blank"
                className="p-4 relative flex flex-col items-center gap-4 duration-700 group md:gap-8 md:py-24  lg:pb-48  md:p-16"
              >
                <span
                  className="absolute w-px h-2/3 bg-gradient-to-b from-zinc-500 via-zinc-500/50 to-transparent"
                  aria-hidden="true"
                />
                <span className="relative z-10 flex items-center justify-center p-3 text-sm duration-1000 border rounded-full text-zinc-200 group-hover:text-white group-hover:bg-zinc-900 border-zinc-500 bg-zinc-900 group-hover:border-zinc-200 drop-shadow-orange">
                  {contact.icon}
                </span>{" "}
                <div className="z-10 flex flex-col items-center">
                  <span className="text-xl font-medium duration-150 lg:text-2xl text-zinc-200 group-hover:text-white font-display text-center">
                    {contact.title}
                  </span>
                  <span className="mt-4 text-md text-center duration-1000 text-zinc-400 group-hover:text-zinc-200">
                    {contact.subTitle}
                  </span>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

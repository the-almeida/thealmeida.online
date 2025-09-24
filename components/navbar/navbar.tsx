import { deleteAuthCookie } from "@/actions/auth.action";
import {
  Button,
  Navbar,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuToggle,
} from "@nextui-org/react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback } from "react";
import { DarkModeSwitch } from "./darkmodeswitch";

interface Props {
  children: React.ReactNode;
}

export const NavbarWrapper = ({ children }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = useCallback(async () => {
    await deleteAuthCookie();
    router.replace("/login");
  }, [router]);
  return (
    <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
      <Navbar
        isBordered
        className="w-full"
        classNames={{
          wrapper: "w-full max-w-full",
        }}
      >
        <NavbarContent className="w-full">
          {pathname === "/clientView" ? "EmpresaDoCliente" : "NepeCorp"}
        </NavbarContent>
        <NavbarContent
          justify="end"
          className="w-fit data-[justify=end]:flex-grow-0 hidden md:flex"
        >
          <NextLink
            href="/"
            className="text-default-900 active:bg-none max-w-full"
          >
            <NavbarItem title="AdminView" isActive={pathname === "/"}>
              AdminView
            </NavbarItem>
          </NextLink>
          <NextLink
            href="/clientView"
            className="text-default-900 active:bg-none max-w-full"
          >
            <NavbarItem
              title="ClientView"
              isActive={pathname === "/clientView"}
            >
              ClientView
            </NavbarItem>
          </NextLink>
          <NavbarItem>
            <DarkModeSwitch />
          </NavbarItem>
          <NavbarItem>
            <Button
              onClick={handleLogout}
              color="danger"
              href="#"
              variant="flat"
            >
              Sair
            </Button>
          </NavbarItem>
        </NavbarContent>

        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="md:hidden"
        />
        <NavbarMenu>
          <NextLink
            href="/"
            className="text-default-900 active:bg-none max-w-full"
            onClick={() => setIsMenuOpen(false)}
          >
            <NavbarItem title="AdminView" isActive={pathname === "/"}>
              AdminView
            </NavbarItem>
          </NextLink>
          <NextLink
            href="/clientView"
            className="text-default-900 active:bg-none max-w-full"
          >
            <NavbarItem
              title="ClientView"
              isActive={pathname === "/clientView"}
            >
              ClientView
            </NavbarItem>
          </NextLink>
          <NavbarItem>
            <DarkModeSwitch />
          </NavbarItem>
          <NavbarItem>
            <Button
              onClick={handleLogout}
              color="danger"
              href="#"
              variant="flat"
            >
              Sair
            </Button>
          </NavbarItem>
        </NavbarMenu>
      </Navbar>
      {children}
    </div>
  );
};

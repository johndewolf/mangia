import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./session.server";

import Sidebar from './components/Sidebar'

export const links = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta = () => ({
  charset: "utf-8",
  title: "Remix Notes",
  viewport: "width=device-width,initial-scale=1",
});

export const loader = async ({ request }) => {
  return json({
    user: await getUser(request),
  });
};

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="flex">
        <Sidebar>
          <Outlet />
        </Sidebar>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

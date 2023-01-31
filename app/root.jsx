import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import toastCSS from 'react-toastify/dist/ReactToastify.css'
import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./session.server";

export const links = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }, {rel: "stylesheet", href: toastCSS}];
};

export const meta = () => ({
  charset: "utf-8",
  title: "Mangia: Create and Track Recipes",
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
      <body style={{display: "grid", gridTemplateColumns: "16rem 1fr", minHeight: '100vh'}}>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

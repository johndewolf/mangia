import { faker } from "@faker-js/faker";

function login({
  email = faker.internet.email(undefined, undefined, "example.com"),
} = {}) {
  cy.then(() => ({ email })).as("user");
  cy.exec(
    `npx ./cypress/support/create-user.js "${email}"`
  ).then(({ stdout }) => {
    const cookieValue = stdout
      .replace(/.*<cookie>(?<cookieValue>.*)<\/cookie>.*/s, "$<cookieValue>")
      .trim();
    cy.setCookie("__session", cookieValue);
  });
  return cy.get("@user");
}

function cleanupUser({ email } = {}) {
  if (email) {
    deleteUserByEmail(email);
  }
  // else {
  //   cy.get("@user").then((user) => {
  //     const email = user.email;
  //     if (email) {
  //       deleteUserByEmail(email);
  //     }
  //   });
  // }
  cy.clearCookie("__session");
}

function deleteUserByEmail(email) {
  cy.exec(
    `npx ./cypress/support/delete-user.js "${email}"`
  );

  cy.clearCookie("__session");
}

Cypress.Commands.add("login", login);
Cypress.Commands.add("cleanupUser", cleanupUser);

/*
eslint
  @typescript-eslint/no-namespace: "off",
*/

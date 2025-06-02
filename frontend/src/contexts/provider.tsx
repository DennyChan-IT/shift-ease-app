import { ClerkProvider } from "./clerk-provider";
import { OrganizationContextProvider } from "./organization-context";
import { RouterProvider } from "./router-provider";

export function Providers() {
  return (
    <ClerkProvider>
      <OrganizationContextProvider>
        <RouterProvider />
        </OrganizationContextProvider>
    </ClerkProvider>
  );
}

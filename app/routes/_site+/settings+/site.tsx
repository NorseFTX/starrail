import { useEffect, useState } from "react";

import { redirect } from "@remix-run/node";
import type {
   MetaFunction,
   SerializeFrom,
   ActionFunctionArgs,
} from "@remix-run/node";
import { useFetcher, useRouteLoaderData } from "@remix-run/react";
import { useZorm } from "react-zorm";
import { jsonWithSuccess } from "remix-toast";
import { z } from "zod";
import { zx } from "zodix";

import { Button } from "~/components/Button";
import {
   Description,
   Field,
   FieldGroup,
   Fieldset,
   Label,
   Legend,
} from "~/components/Fieldset";
import { Icon } from "~/components/Icon";
import { Input } from "~/components/Input";
import { Switch, SwitchField } from "~/components/Switch";
import { Strong, TextLink, Text } from "~/components/Text";
import { Textarea } from "~/components/Textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/Tooltip";
import type { loader as siteLoaderType } from "~/routes/_site+/_layout";
import { isAdding, isProcessing } from "~/utils/form";

const SettingsSiteSchema = z.object({
   name: z.string().min(3),
   intent: z.enum(["saveSettings", "addDomain"]),
   siteId: z.string().min(1),
   about: z.string().optional(),
   slug: z.string().min(1),
   isPublic: z.coerce.boolean(),
   enableAds: z.coerce.boolean(),
   gaTagId: z.string().optional(),
   gaPropertyId: z.string().optional(),
});

export default function SiteSettings() {
   const { site } = useRouteLoaderData("routes/_site+/_layout") as {
      site: SerializeFrom<typeof siteLoaderType>["site"];
   };
   const accessText = site.isPublic ? "publicly" : "privately";

   const zo = useZorm("settings", SettingsSiteSchema);

   const fetcher = useFetcher();

   const saving = isAdding(fetcher, "saveSettings");
   const disabled =
      isProcessing(fetcher.state) || zo.validation?.success === false;

   const [isChanged, setIsChanged] = useState(false);

   useEffect(() => {
      if (!saving) {
         setIsChanged(false);
      }
   }, [saving]);

   return (
      <fetcher.Form
         className="h-full relative"
         method="post"
         onChange={() => setIsChanged(true)}
         ref={zo.ref}
      >
         <input type="hidden" name={zo.fields.siteId()} value={site.id} />
         <FieldGroup>
            <SwitchField className="p-4 rounded-xl border border-color-sub bg-2-sub shadow-sm dark:shadow-zinc-800/50">
               <Label>Allow Public Access</Label>
               <Description>
                  Make your site public to allow anyone to view it
               </Description>
               <Switch
                  //@ts-ignore
                  defaultChecked={site.isPublic}
                  onChange={() => setIsChanged(true)}
                  value="true"
                  color="dark/white"
                  name={zo.fields.isPublic()}
               />
            </SwitchField>

            <Field>
               <Label>Slug</Label>
               <Input
                  defaultValue={site.slug ?? ""}
                  name={zo.fields.slug()}
                  type="text"
               />
               <Description>
                  Your site is{" "}
                  <Strong>
                     <i>{accessText}</i>
                  </Strong>{" "}
                  viewable at{" "}
                  <TextLink
                     target="_blank"
                     href={`https://${site.slug}.mana.wiki`}
                  >
                     {site.slug}.mana.wiki
                  </TextLink>
                  . You can change this to a custom domain{" "}
                  <TextLink href="/settings/domain">here</TextLink>.
               </Description>
            </Field>
            <Field>
               <Label>Name</Label>
               <Input
                  name={zo.fields.name()}
                  defaultValue={site.name}
                  type="text"
               />
            </Field>
            <Field>
               <Label>About</Label>
               <Textarea
                  defaultValue={site.about ?? ""}
                  name={zo.fields.about()}
               />
            </Field>
            <SwitchField className="p-4 rounded-xl border border-color-sub bg-2-sub shadow-sm dark:shadow-zinc-800/50">
               <Label>Enable Ads</Label>
               <Description>
                  Earn revenue by displaying ads on your site
               </Description>
               <Switch
                  onChange={() => setIsChanged(true)}
                  //@ts-ignore
                  defaultChecked={site.enableAds}
                  color="dark/white"
                  value="true"
                  name={zo.fields.enableAds()}
               />
            </SwitchField>
         </FieldGroup>
         <Fieldset className="py-6 border-y-2 border-color border-dashed mt-8">
            <Legend>Analytics</Legend>
            <Text>
               Track your site's performance with Google Analytics. Learn how to
               create a free Google Analytics account{" "}
               <TextLink
                  target="_blank"
                  href="https://support.google.com/analytics/answer/9304153?hl=en"
               >
                  here
               </TextLink>
               .
            </Text>
            <FieldGroup>
               <Field>
                  <Label>Google Analytics Tracking Id</Label>
                  <Input
                     defaultValue={site.gaTagId ?? ""}
                     name={zo.fields.gaTagId()}
                     type="text"
                  />
               </Field>
               <Field>
                  <Label>Google Analytics Property Id</Label>
                  <Input
                     defaultValue={site.gaPropertyId ?? ""}
                     name={zo.fields.gaPropertyId()}
                     type="text"
                  />
                  <Description>
                     Grant view access to the associated Google Analytics
                     property to generate trending pages.
                  </Description>
               </Field>
            </FieldGroup>
         </Fieldset>
         <div className="pt-6 flex items-center gap-3 justify-end">
            {isChanged && (
               <Tooltip placement="top">
                  <TooltipTrigger
                     onClick={() => {
                        //@ts-ignore
                        zo.refObject.current.reset();
                        setIsChanged(false);
                     }}
                     className="text-xs cursor-pointer hover:dark:bg-dark400 
                      flex items-center justify-center w-7 h-7 rounded-full"
                  >
                     <Icon
                        title="Reset"
                        size={16}
                        name="refresh-ccw"
                        className="dark:text-zinc-500"
                     />
                  </TooltipTrigger>
                  <TooltipContent>Reset</TooltipContent>
               </Tooltip>
            )}
            <input type="hidden" name="intent" value="saveSettings" />
            <Button
               type="submit"
               color="dark/white"
               className="cursor-pointer !font-bold text-sm h-9 w-16"
               disabled={!isChanged || disabled}
            >
               {saving ? (
                  <Icon
                     size={16}
                     name="loader-2"
                     className="mx-auto animate-spin"
                  />
               ) : (
                  "Save"
               )}
            </Button>
         </div>
      </fetcher.Form>
   );
}

export const meta: MetaFunction = ({ matches }) => {
   const siteName = matches.find(
      ({ id }: { id: string }) => id === "routes/_site+/_layout",
      //@ts-ignore
   )?.data?.site.name;

   return [
      {
         title: `Site | Settings - ${siteName}`,
      },
   ];
};

export async function action({
   context: { payload, user },
   request,
}: ActionFunctionArgs) {
   const formData = await zx.parseForm(request, SettingsSiteSchema);

   if (!user) throw redirect("/404", 404);

   switch (formData.intent) {
      case "saveSettings": {
         await payload.update({
            collection: "sites",
            id: formData.siteId,
            //@ts-ignore
            data: {
               ...formData,
            },
            overrideAccess: false,
            user,
         });
         return jsonWithSuccess(null, "Settings updated");
      }
   }
}

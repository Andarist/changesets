import publishPackages from "./publishPackages";
import { ExitError } from "@changesets/errors";
import { error, log, success } from "@changesets/logger";
import * as git from "@changesets/git";
import { Config } from "@changesets/types";

function logReleases(pkgs: Array<{ name: string; newVersion: string }>) {
  const mappedPkgs = pkgs.map(p => `${p.name}@${p.newVersion}`).join("\n");
  log(mappedPkgs);
}

export default async function run(
  cwd: string,
  { otp }: { otp?: string },
  config: Config
) {
  const response = await publishPackages({
    cwd: cwd,
    // if not public, we wont pass the access, and it works as normal
    access: config.access,
    otp: otp
  });

  const successful = response.filter(p => p.published);
  const unsuccessful = response.filter(p => !p.published);

  if (successful.length > 0) {
    success("packages published successfully:");
    logReleases(successful);
    // We create the tags after the push above so that we know that HEAD wont change and that pushing
    // wont suffer from a race condition if another merge happens in the mean time (pushing tags wont
    // fail if we are behind master).
    log("Creating tags...");
    for (const pkg of successful) {
      const tag = `${pkg.name}@${pkg.newVersion}`;
      log("New tag: ", tag);
      await git.tag(tag, cwd);
    }
  }

  if (unsuccessful.length > 0) {
    error("packages failed to publish:");

    logReleases(unsuccessful);
    throw new ExitError(1);
  }
}

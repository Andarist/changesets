// This function takes in changesets and returns one release per
// package listed in the changesets

import { NewChangeset, Workspace, VersionType } from "@changesets/types";
import { InternalRelease } from "./types";

export default function flattenReleases(
  changesets: NewChangeset[],
  workspaces: Workspace[]
): InternalRelease[] {
  let releases: Map<
    string,
    {
      name: string;
      type: VersionType;
      oldVersion: string;
      changesets: string[];
    }
  > = new Map();

  changesets.forEach(changeset => {
    changeset.releases.forEach(({ name, type }) => {
      let release = releases.get(name);
      let ws = workspaces.find(ws => ws.name === name);
      if (!ws) {
        throw new Error(`Could not find package information for ${name}`);
      }
      let { config } = ws;
      if (!release) {
        release = {
          name,
          type,
          oldVersion: config.version,
          changesets: [changeset.id]
        };
      } else {
        // If the type was already major, we never need to update it
        if (release.type === "minor" && type === "major") {
          release.type = type;
        } else if (
          release.type === "patch" &&
          (type === "major" || type === "minor")
        ) {
          release.type = type;
        }
        // Check whether the bumpType will change
        // If the bumpType has changed recalc newVersion
        // push new changeset to releases
        release.changesets.push(changeset.id);
      }

      releases.set(name, release);
    });
  });

  return [...releases.values()];
}

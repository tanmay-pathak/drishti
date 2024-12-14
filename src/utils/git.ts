import { execSync } from "child_process";

export async function getCurrentBranch(): Promise<string> {
  return execSync("git branch --show-current").toString().trim();
}

export async function switchBranch(branch: string): Promise<void> {
  // Redirect stderr to stdout to capture all output
  execSync(`git stash -u 2>&1`); // Stash all changes including untracked files
  console.log(); // Add newline after stash output
  execSync(`git checkout ${branch} 2>&1`);
  console.log(); // Add newline after checkout output
}

export async function restoreOriginalBranch(
  originalBranch: string,
): Promise<void> {
  try {
    await switchBranch(originalBranch);
    execSync("git stash pop 2>&1 || true"); // Try to pop stash if it exists
    console.log(); // Add newline after stash pop output
  } catch (e) {
    // Ignore errors during cleanup
  }
}

import { loadEnvConfig } from "@next/env";
import { hashPassword } from "../src/lib/security";
loadEnvConfig(process.cwd());
async function main() {
  const password=process.env.ADMIN_PASSWORD;
  if (!password || password.length<16) throw new Error("Define ADMIN_PASSWORD temporalmente en el entorno con al menos 16 caracteres.");
  console.log("ADMIN_PASSWORD_HASH=" + await hashPassword(password));
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});


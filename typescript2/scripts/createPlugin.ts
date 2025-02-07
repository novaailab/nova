#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type PluginType = "evm" | "solana" | "any";

const program = new Command();

interface PluginOptions {
    name: string;
    type: "evm" | "solana" | "any";
}

// Validate plugin name format
function validatePluginName(name: string): boolean {
    return /^[a-z0-9-]+$/.test(name);
}

// Get wallet client import based on plugin type
function getWalletClientImport(type: PluginOptions["type"]): string {
    switch (type) {
        case "evm":
            return 'import { EVMWalletClient } from "@nova-sdk/wallet-evm";';
        case "solana":
            return 'import { SolanaWalletClient } from "@nova-sdk/wallet-solana";';
        case "any":
            return 'import { WalletClientBase } from "@nova-sdk/core";';
    }
}

// Get wallet client type based on plugin type
function getWalletClientType(type: PluginOptions["type"]): string {
    switch (type) {
        case "evm":
            return "EVMWalletClient";
        case "solana":
            return "SolanaWalletClient";
        case "any":
            return "WalletClientBase";
    }
}

// Get dependencies based on plugin type
function getDependencies(type: PluginOptions["type"]): Record<string, string> {
    const deps: Record<string, string> = {
        "@nova-sdk/core": "workspace:*",
        zod: "catalog:",
    };

    switch (type) {
        case "evm":
            deps["@nova-sdk/wallet-evm"] = "workspace:*";
            break;
        case "solana":
            deps["@nova-sdk/wallet-solana"] = "workspace:*";
            break;
    }

    return deps;
}

// Create package.json content
function createPackageJson(options: PluginOptions): string {
    const { name, type } = options;
    const dependencies = getDependencies(type);

    const packageJson = {
        name: `@nova-sdk/plugin-${name}`,
        version: "0.1.0",
        files: ["dist/**/*", "README.md", "package.json"],
        scripts: {
            build: "tsup",
            clean: "rm -rf dist",
            test: "vitest run --passWithNoTests",
        },
        main: "./dist/index.js",
        module: "./dist/index.mjs",
        types: "./dist/index.d.ts",
        sideEffects: false,
        repository: {
            type: "git",
            url: "git+https://github.com/novaailab/nova.git",
        },
        license: "MIT",
        bugs: {
            url: "https://github.com/novaailab/nova/issues",
        },
        keywords: ["ai", "agents", "web3"],
        dependencies,
        peerDependencies: {
            "@nova-sdk/core": "workspace:*",
        },
    };
    return JSON.stringify(packageJson, null, 4);
}

// Create parameters.ts content
function createParametersContent(): string {
    return `import { createToolParameters } from "@nova-sdk/core";
import { z } from "zod";

export class ExampleParameters extends createToolParameters(
    z.object({
        exampleField: z.string().describe("An example field"),
    }),
) {}
`;
}

// Convert kebab-case to PascalCase
function kebabToPascalCase(str: string): string {
    return str
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
}

// Create service.ts content
function createServiceContent(options: PluginOptions): string {
    const { name, type } = options;
    const walletClientImport = getWalletClientImport(type);
    const walletClientType = getWalletClientType(type);
    const className = kebabToPascalCase(name);
    const functionName = name.replace(/-/g, "_");

    return `import { Tool } from "@nova-sdk/core";
${walletClientImport}
import { ExampleParameters } from "./parameters";

export class ${className}Service {
    @Tool({
        name: "${functionName}_example",
        description: "An example method in ${className}Service",
    })
    async doSomething(walletClient: ${walletClientType}, parameters: ExampleParameters) {
        // Implementation goes here
        return "Hello from ${className}Service!";
    }
}
`;
}

// Create plugin.ts content
function createPluginContent(options: PluginOptions): string {
    const { name } = options;
    const className = kebabToPascalCase(name);
    const functionName = name.replace(/-/g, "");

    return `import { PluginBase } from "@nova-sdk/core";
import { ${className}Service } from "./${name}.service";

export class ${className}Plugin extends PluginBase {
    constructor() {
        super("${name}", [new ${className}Service()]);
    }

    supportsChain = () => true;
}

export function ${functionName}() {
    return new ${className}Plugin();
}
`;
}

// Create index.ts content
function createIndexContent(options: PluginOptions): string {
    const { name } = options;
    return `export * from "./${name}.plugin";
export * from "./parameters";
`;
}

// Create all necessary files for the plugin
async function createPlugin(options: PluginOptions): Promise<void> {
    const { name } = options;
    const rootDir = process.cwd();
    const pluginDir = path.join(rootDir, "packages", "plugins", name);
    const srcDir = path.join(pluginDir, "src");

    // Create directories
    fs.mkdirSync(pluginDir, { recursive: true });
    fs.mkdirSync(srcDir, { recursive: true });

    // Copy configuration files from superfluid plugin
    const superfluidDir = path.join(rootDir, "packages", "plugins", "superfluid");
    const configFiles = ["tsconfig.json", "tsup.config.ts", "turbo.json"];

    for (const file of configFiles) {
        const sourcePath = path.join(superfluidDir, file);
        const targetPath = path.join(pluginDir, file);
        try {
            if (fs.existsSync(sourcePath)) {
                fs.copyFileSync(sourcePath, targetPath);
            } else {
                console.warn(`Warning: Could not find ${file} in superfluid plugin`);
            }
        } catch (error) {
            console.error(`Error copying ${file}:`, error);
            throw error;
        }
    }

    // Create all files first
    console.log("Creating plugin files...");
    // Create package.json
    const packageJsonPath = path.join(pluginDir, "package.json");
    fs.writeFileSync(packageJsonPath, createPackageJson(options));
    console.log("✓ Created package.json");

    // Create source files
    const sourceFiles = {
        "parameters.ts": createParametersContent(),
        [`${name}.service.ts`]: createServiceContent(options),
        [`${name}.plugin.ts`]: createPluginContent(options),
        "index.ts": createIndexContent(options),
    };

    for (const [file, content] of Object.entries(sourceFiles)) {
        const filePath = path.join(srcDir, file);
        fs.writeFileSync(filePath, content);
        console.log(`✓ Created ${file}`);
    }

    // Verify all required files exist
    const requiredFiles = [
        packageJsonPath,
        path.join(pluginDir, "tsconfig.json"),
        path.join(pluginDir, "tsup.config.ts"),
        path.join(pluginDir, "turbo.json"),
        ...Object.keys(sourceFiles).map((file) => path.join(srcDir, file)),
    ];

    console.log("\nVerifying required files...");
    for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
            throw new Error(`Required file missing: ${file}`);
        }
        console.log(`✓ Verified ${path.basename(file)}`);
    }

    // Install dependencies and build
    try {
        console.log("\nInstalling dependencies...");
        const { execSync } = await import("node:child_process");
        await execSync("pnpm install", { stdio: "inherit", cwd: rootDir });
        console.log("✓ Dependencies installed");
        console.log("\nBuilding plugin...");
        await execSync("pnpm build", { stdio: "inherit", cwd: pluginDir });
        console.log("✓ Plugin built successfully");
    } catch (error) {
        console.error("Error during install/build:", error);
        throw error;
    }

    console.log(`\nPlugin ${name} created successfully!`);
}

// Set up command line interface
program
    .name("createPlugin")
    .description("Create a new nova SDK plugin")
    .requiredOption("-n, --name <name>", "plugin name (lowercase, hyphen-separated)")
    .option("-t, --type <type>", "plugin type (evm, solana, or any)", "any")
    .action(async (options: { name: string; type: string }) => {
        const { name, type } = options;

        // Validate inputs
        if (!validatePluginName(name)) {
            console.error("Error: Plugin name must be lowercase and may only contain letters, numbers, and hyphens");
            process.exit(1);
        }

        const validTypes = ["evm", "solana", "any"] as const;
        const pluginType = type || "any";

        if (!validTypes.includes(pluginType as (typeof validTypes)[number])) {
            console.error("Error: Plugin type must be one of: evm, solana, any");
            process.exit(1);
        }

        try {
            await createPlugin({ name, type: pluginType as PluginOptions["type"] });
        } catch (error) {
            console.error("Error creating plugin:", error);
            process.exit(1);
        }
    });

program.parse();

import { awscdk } from 'projen';

const name = 'cdk-ssm-deployer';

const project = new awscdk.AwsCdkTypeScriptApp({
    authorName: 'DevOps@Home',
    authorUrl: 'https://devops-at-ho.me',
    defaultReleaseBranch: 'main',
    cdkVersion: '2.51.1',
    name,
    packageName: name.toLowerCase().replace(/\./g, '-'),
    licensed: false,
    projenrcTs: true,
    eslint: false,
    prettier: true,
    prettierOptions: {
        settings: {
            printWidth: 100,
            tabWidth: 4,
            singleQuote: true,
        },
    },
    githubOptions: {
        pullRequestLint: false,
    },
    deps: ['aws-lambda', 'aws-cdk-github-oidc'],
    devDeps: ['esbuild@0', '@types/aws-lambda', '@types/node'],
    gitignore: ['.idea'],
});

project.jest!.addTestMatch('**/?(*.)@(spec|test).[tj]s?(x)');

project.synth();

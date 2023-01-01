import { awscdk } from 'projen';

const name = 'cdk-ssm-deployer';

const project = new awscdk.AwsCdkTypeScriptApp({
    authorName: 'DevOps@Home',
    authorUrl: 'https://devops-at-ho.me',
    defaultReleaseBranch: 'main',
    cdkVersion: '2.58.1',
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
        mergify: false, // Mergify disabled on private repos
    },
    deps: ['aws-cdk-github-oidc'],
    devDeps: ['esbuild@0', '@types/aws-lambda', '@types/node'],
    gitignore: ['.idea'],
});

project.addTask('cdk-deploy-test', {
    exec: 'cdk deploy --ci --require-approval never --progress events SSMDeployer-SharedStack-test SSMDeployer-DestinationStack-h6???-???-test',
});

// Remember to add SSMDeployer-SSMDocsStack
project.addTask('cdk-deploy-prod', {
    exec: 'cdk deploy --ci --require-approval never --progress events SSMDeployer-OIDCStack SSMDeployer-SharedStack SSMDeployer-DestinationStack-h6???-???',
});

project.jest!.addTestMatch('**/?(*.)@(spec|test).[tj]s?(x)');

project.synth();

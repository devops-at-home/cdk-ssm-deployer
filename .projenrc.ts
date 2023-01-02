import { awscdk } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';

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
    release: true,
});

project.release?.addJobs({
    deploy_aws: {
        strategy: {
            failFast: true,
            matrix: {
                include: [{ target: 'test' }, { target: 'prod' }],
            },
        },
        runsOn: ['ubuntu-latest'],
        needs: ['release_github'],
        permissions: { contents: JobPermission.READ, idToken: JobPermission.WRITE },
        env: {
            CI: 'true',
        },
        name: 'Deployment to ${{ matrix.target }} for ${{ github.ref }}',
        steps: [
            // {
            //     name: 'Checkout',
            //     uses: 'actions/checkout@v3',
            //     with: { fetchDepth: 0 },
            // },
            {
                name: 'Setup node',
                uses: 'actions/setup-node@v3',
                with: { 'node-version': '14.x' },
            },
            {
                name: 'Download build artifacts',
                uses: 'actions/download-artifact@v3',
                with: { name: 'build-artifact', path: 'dist' },
            },
            {
                name: 'Get release tag',
                id: 'get-release-tag',
                run: 'echo "RELEASE_TAG=$(cat dist/releasetag.txt)" >> $GITHUB_OUTPUT',
            },
            {
                name: 'Download release',
                env: {
                    GH_TOKEN: '${{ github.token }}',
                    RELEASE_TAG: '${{ steps.get-release-tag.outputs.RELEASE_TAG }}',
                },
                // run: 'cat dist/releasetag.txt; git checkout tags/$(cat dist/releasetag.txt)', -o cdk-ssm-deployer.tar.gz
                run: 'curl -H "Authorization: Bearer $GH_TOKEN" -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" -L "https://api.github.com/repos/${GITHUB_REPOSITORY}/tarball/${RELEASE_TAG}" -o output.tar.gz',
            },
            {
                name: 'Next steps',
                run: 'ls -l; ls -l dist; tar xf output.tar.gz; ls -l; ls -l dist',
            },
            {
                name: 'Assume role using OIDC',
                uses: 'aws-actions/configure-aws-credentials@v1-node16',
                with: {
                    'role-to-assume': '{{ secrets.OIDC_ROLE }}',
                    'aws-region': 'ap-southeast-2',
                },
            },
            {
                name: 'Install package dependencies',
                run: 'yarn install',
            },
            {
                name: 'Deploy CDK',
                env: {
                    ENVIRONMENT: '${{ matrix.target }}',
                },
                run: 'echo $ENVIRONMENT; yarn synth',
                // run: 'yarn cdk-deploy-$ENVIRONMENT',
            },
        ],
    },
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

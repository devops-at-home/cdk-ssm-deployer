import { awscdk } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';

const name = 'cdk-ssm-deployer';

const project = new awscdk.AwsCdkTypeScriptApp({
    authorName: 'DevOps@Home',
    authorUrl: 'https://devops-at-ho.me',
    defaultReleaseBranch: 'main',
    cdkVersion: '2.68.0',
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
            maxParallel: 1,
        },
        runsOn: ['ubuntu-latest'],
        needs: ['release_github'],
        permissions: { contents: JobPermission.READ, idToken: JobPermission.WRITE },
        env: {
            CI: 'true',
        },
        environment: '${{ matrix.target }}',
        name: 'Deployment to ${{ matrix.target }}',
        steps: [
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
                run: 'curl -H "Authorization: Bearer $GH_TOKEN" -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" -L "https://api.github.com/repos/${GITHUB_REPOSITORY}/tarball/${RELEASE_TAG}" -o release.tar.gz',
            },
            {
                name: 'Extract and get folder name',
                id: 'extract-folder',
                run: 'tar xf release.tar.gz; FOLDER_NAME=$(find . -maxdepth 1 -name "${GITHUB_REPOSITORY_OWNER}*"); echo FOLDER_NAME=$FOLDER_NAME | tee -a $GITHUB_OUTPUT',
            },
            {
                name: 'Assume role using OIDC',
                uses: 'aws-actions/configure-aws-credentials@v1-node16',
                with: {
                    'role-to-assume': '${{ secrets.OIDC_ROLE }}',
                    'aws-region': 'ap-southeast-2',
                },
            },
            {
                name: 'Install package dependencies',
                workingDirectory: '${{ steps.extract-folder.outputs.FOLDER_NAME }}',
                run: 'ls -l; yarn install',
            },
            {
                name: 'Deploy CDK',
                env: {
                    ENVIRONMENT: '${{ matrix.target }}',
                },
                workingDirectory: '${{ steps.extract-folder.outputs.FOLDER_NAME }}',
                run: 'yarn cdk-deploy-$ENVIRONMENT',
            },
        ],
    },
});

const cdkCmdStart = 'cdk deploy --ci --require-approval never --progress events';

project.addTask('cdk-deploy-test', {
    exec: `${cdkCmdStart} SSMDeployer-SharedStack-test SSMDeployer-*Stack-h6???-???-test`,
});

// Remember to add SSMDeployer-SSMDocsStack
project.addTask('cdk-deploy-prod', {
    exec: `${cdkCmdStart} SSMDeployer-OIDCStack SSMDeployer-SharedStack SSMDeployer-*Stack-h6???-???`,
});

project.jest!.addTestMatch('**/?(*.)@(spec|test).[tj]s?(x)');

project.synth();

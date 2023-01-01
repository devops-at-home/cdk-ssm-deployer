import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { GithubActionsIdentityProvider, GithubActionsRole } from 'aws-cdk-github-oidc';
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam';

interface OIDCStackProps extends StackProps, OidcConfig {}

export type OidcConfig = {
    owner: string;
    repo: string;
    filter: string;
    lookup?: boolean;
};

export class OIDCStack extends Stack {
    constructor(scope: Construct, id: string, props: OIDCStackProps) {
        super(scope, id, props);

        const { owner, repo, filter } = props;

        const provider = props.lookup
            ? GithubActionsIdentityProvider.fromAccount(this, 'GithubProvider')
            : new GithubActionsIdentityProvider(this, 'GithubProvider');

        const deployRole = new GithubActionsRole(this, 'DeployRole', {
            provider,
            owner,
            repo,
            filter,
            maxSessionDuration: Duration.hours(2),
        });

        // You may also use various "add*" policy methods!
        // "AdministratorAccess" not really a good idea, just for an example here:
        deployRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));
    }
}

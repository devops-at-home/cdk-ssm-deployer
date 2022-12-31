import { App, StackProps } from 'aws-cdk-lib';
import { DestinationStack } from './stacks/destination.stack';
import { OIDCStack } from './stacks/oidc.stack';
import { SharedStack } from './stacks/shared.stack';
import { SSMDocsStack } from './stacks/ssm-docs.stack';
import { AppFactoryProps } from './types';

export const appFactory = (app: App, props: AppFactoryProps) => {
    const { environment, account, region, instances } = props;

    const stackProps: StackProps = {
        env: { account, region },
        tags: {
            environment,
        },
    };

    new SharedStack(app, `SSMDeployer-SharedStack-${props.environment}`, {
        ...stackProps,
        environment,
    });

    if (props.oidcConfig) {
        new OIDCStack(app, 'SSMDeployer-OIDCStack', {
            ...stackProps,
            ...props.oidcConfig,
        });
    }

    if (props.environment === 'prod') {
        new SSMDocsStack(app, 'SSMDeployer-SSMDocsStack', {
            ...stackProps,
        });
    }

    instances.forEach(({ name }) => {
        new DestinationStack(app, `SSMDeployer-DestinationStack-${name}`, {
            environment,
            instanceName: name,
        });
    });
};

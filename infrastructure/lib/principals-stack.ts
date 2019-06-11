import { CfnAccessKey, IRole, IUser, PolicyStatement, Role, User } from '@aws-cdk/aws-iam';
import { CfnOutput, Construct, Stack, StackProps } from '@aws-cdk/cdk';

export class PrincipalsStack extends Stack {

  public readonly trustedUser: IUser;
  public readonly untrustedUser: IUser;
  public readonly trustedRole: IRole;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.trustedUser = this.createTrustedUser();
    this.untrustedUser = this.createUntrustedUser();
    this.trustedRole = this.createTrustedRole();
  }

  private createTrustedUser(): IUser {
    // Create user
    const user = new User(this, 'TrustedUser', {
      userName: 'trusted-user',
    });

    user.attachManagedPolicy('arn:aws:iam::aws:policy/AmazonAPIGatewayInvokeFullAccess');

    // Create access key
    const accessKey = new CfnAccessKey(this, 'TrustedUserAccessKey', {
      userName: user.userName,
    });

    // Create outputs
    new CfnOutput(this, 'TrustedUserAccessKeyId', {
      value: accessKey.accessKeyId,
    });

    new CfnOutput(this, 'TrustedUserSecretAccessKey', {
      value: accessKey.accessKeySecretAccessKey,
    });

    return user;
  }

  private createUntrustedUser(): IUser {
    // Create user
    const user = new User(this, 'UntrustedUser', {
      userName: 'untrusted-user',
    });

    // Create access key
    const accessKey = new CfnAccessKey(this, 'UntrustedUserAccessKey', {
      userName: user.userName,
    });

    // Create outputs
    new CfnOutput(this, 'UntrustedUserAccessKeyId', {
      value: accessKey.accessKeyId,
    });

    new CfnOutput(this, 'UntrustedUserSecretAccessKey', {
      value: accessKey.accessKeySecretAccessKey,
    });

    return user;
  }

  private createTrustedRole(): IRole {
    const role = new Role(this, 'ApiGatewayRole', {
      assumedBy: this.untrustedUser,
      roleName: 'ApiGatewayInvoke',
    });

    role.addToPolicy(new PolicyStatement()
      .addActions('execute-api:Invoke', 'execute-api:ManageConnections')
      .addResource('arn:aws:execute-api:*:*:*'));

    new CfnOutput(this, 'TrustedRoleArn', {
      value: role.roleArn,
    });

    return role;
  }
}

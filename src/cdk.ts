import { App, CfnParameter, Construct, Stack, StackProps } from "@aws-cdk/core";
import { Vpc } from "@aws-cdk/aws-ec2";
import {
  AssetImage,
  AwsLogDriver,
  Cluster,
  FargateService,
  FargateTaskDefinition
} from "@aws-cdk/aws-ecs";
import { PolicyStatement } from "@aws-cdk/aws-iam";

const LIST_REGEX = (item: string) => `^(${item}(,${item})*)?$`;
const PHONE_NUMBER_REGEX = "\\+[1-9]\\d{1,14}";
const PRODUCT_REGEX = "\\d{7}";

class BestBuyerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const phoneNumbers = new CfnParameter(this, "PhoneNumbers", {
      allowedPattern: LIST_REGEX(PHONE_NUMBER_REGEX),
      type: "String",
      default: ""
    });
    const productSkus = new CfnParameter(this, "ProductSkus", {
      allowedPattern: LIST_REGEX(PRODUCT_REGEX),
      type: "String",
      default: ""
    });

    const cluster = new Cluster(this, "Cluster", {
      vpc: Vpc.fromLookup(this, "DefaultVPC", {
        isDefault: true
      })
    });

    const taskDefinition = new FargateTaskDefinition(this, "TaskDefinition", {
      cpu: 512,
      memoryLimitMiB: 1024
    });
    taskDefinition.addContainer("Container", {
      image: AssetImage.fromAsset("./dist/"),
      environment: {
        PHONE_NUMBERS: phoneNumbers.valueAsString,
        PRODUCT_SKUS: productSkus.valueAsString
      },
      logging: new AwsLogDriver({
        streamPrefix: "BestBuyer",
        logRetention: 30
      })
    });
    taskDefinition.addToTaskRolePolicy(
      PolicyStatement.fromJson({
        Effect: "Allow",
        Action: "sns:Publish",
        NotResource: "arn:aws:sns:*:*:*"
      })
    );

    new FargateService(this, "FargateService", {
      cluster,
      taskDefinition,
      assignPublicIp: true,
      desiredCount: 1
    });
  }
}

const app = new App();
new BestBuyerStack(app, "BestBuyer", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});

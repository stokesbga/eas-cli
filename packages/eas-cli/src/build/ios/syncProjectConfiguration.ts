import { ExpoConfig } from '@expo/config';
import { Platform, Workflow } from '@expo/eas-build-job';
import { IosVersionAutoIncrement } from '@expo/eas-json';

import { Target } from '../../credentials/ios/types';
import { isExpoUpdatesInstalled } from '../../project/projectUtils';
import { resolveWorkflowAsync } from '../../project/workflow';
import { syncUpdatesConfigurationAsync } from '../../update/ios/UpdatesModule';
import { BumpStrategy, bumpVersionAsync, bumpVersionInAppJsonAsync } from './version';

export async function syncProjectConfigurationAsync({
  projectDir,
  exp,
  targets,
  localAutoIncrement,
}: {
  projectDir: string;
  exp: ExpoConfig;
  targets: Target[];
  localAutoIncrement?: IosVersionAutoIncrement;
}): Promise<void> {
  const workflow = await resolveWorkflowAsync(projectDir, Platform.IOS);
  const versionBumpStrategy = resolveVersionBumpStrategy(localAutoIncrement ?? false);

  if (workflow === Workflow.GENERIC) {
    if (isExpoUpdatesInstalled(projectDir)) {
      await syncUpdatesConfigurationAsync(projectDir, exp);
    }
    await bumpVersionAsync({ projectDir, exp, bumpStrategy: versionBumpStrategy, targets });
  } else {
    await bumpVersionInAppJsonAsync({ projectDir, exp, bumpStrategy: versionBumpStrategy });
  }
}

function resolveVersionBumpStrategy(autoIncrement: IosVersionAutoIncrement): BumpStrategy {
  if (autoIncrement === true) {
    return BumpStrategy.BUILD_NUMBER;
  } else if (autoIncrement === false) {
    return BumpStrategy.NOOP;
  } else if (autoIncrement === 'buildNumber') {
    return BumpStrategy.BUILD_NUMBER;
  } else {
    return BumpStrategy.APP_VERSION;
  }
}

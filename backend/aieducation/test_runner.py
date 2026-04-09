from pathlib import Path

from django.apps import apps
from django.conf import settings
from django.test.runner import DiscoverRunner


class ProjectDiscoverRunner(DiscoverRunner):
    """Include the repository-level tests package in default test discovery."""

    def build_suite(self, test_labels=None, **kwargs):
        if test_labels:
            return super().build_suite(test_labels, **kwargs)

        base_dir = Path(settings.BASE_DIR).resolve()
        local_labels = []

        for app_config in apps.get_app_configs():
            app_path = Path(app_config.path).resolve()
            if not (app_path == base_dir or base_dir in app_path.parents):
                continue

            has_test_module = (app_path / "tests.py").exists()
            has_test_package = (app_path / "tests").is_dir()
            if has_test_module or has_test_package:
                local_labels.append(f"{app_config.name}.tests")

        local_labels.append("tests")
        return super().build_suite(list(dict.fromkeys(local_labels)), **kwargs)

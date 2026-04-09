from rest_framework import permissions


class IsOwnerStudent(permissions.BasePermission):
    """Allow access only if request.user is the 'student' on the object."""

    def has_object_permission(self, request, view, obj):
        return obj.student == request.user


class IsAssignedConsultant(permissions.BasePermission):
    """Allow access if the request user has a ConsultantProfile assigned to the object."""

    def has_object_permission(self, request, view, obj):
        consultant = getattr(obj, 'consultant', None)
        if consultant is None:
            return False
        return consultant.user == request.user


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow write operations only for admin/staff; everyone authenticated can read."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_staff

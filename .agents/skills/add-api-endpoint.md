# Skill: Add an API Endpoint

## Steps

### 1. Update the API contract
Add the new route to docs/api-contract.md:
- Method, path, allowed roles, request body schema, response schema, object-auth rule.

### 2. Add the route
In backend/src/Router.php, register the route pointing to the new controller method.

### 3. Write the validator
In backend/src/Validators/{Name}Validator.php:
- Validate all input fields (required, type, length, enum whitelist).
- Return either validated+sanitised data or an array of error messages.

### 4. Write the repository method
In backend/src/Repositories/{Name}Repository.php:
- Use PDO prepared statements only.
- Return typed arrays or null. Never return raw PDOStatement.

### 5. Write the controller
In backend/src/Controllers/{Name}Controller.php:
- Call middleware (auth check is already run by Router).
- Call the validator. Return 422 on failure.
- Call the repository.
- **Authorise the object**: check the fetched record belongs to the authenticated user.
  e.g., if a student requests their diagnosis, confirm diagnosis.student_id == auth.user.id
- Return JSON response.

### 6. Write tests
In backend/tests/{Name}ControllerTest.php:
- Happy path: correct role, correct data, correct object ownership.
- Auth error: unauthenticated (401).
- Role error: wrong role (403).
- Object auth error: correct role but wrong object owner (403 or 404).
- Validation error: missing/invalid field (422).

### 7. Update docs/api-contract.md
Mark the route as ✅ Implemented.

## Authorisation rule reminder
```php
// Example: ensure student owns the diagnosis
$diagnosis = $this->diagnosisRepo->findById($diagnosisId);
if (!$diagnosis || $diagnosis['student_id'] !== $request->user['id']) {
    return $response->json(['status'=>'error','code'=>'NOT_FOUND','message'=>'Not found.'], 404);
}
```
Always return 404 (not 403) when hiding existence of another user's resource from students.

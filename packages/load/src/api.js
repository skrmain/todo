import http from 'k6/http';
import { check, fail } from 'k6';

const baseUrl = (__ENV.BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

export const options = {
    thresholds: {
        checks: ['rate>0.99'],
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
    },
};

export default function () {
    const health = http.get(`${baseUrl}/`);
    check(health, {
        'GET / returns 200': (response) => response.status === 200,
    });

    const todos = http.get(`${baseUrl}/todos?limit=10`);
    check(todos, {
        'GET /todos returns 200': (response) => response.status === 200,
        'GET /todos returns a data array': (response) => Array.isArray(response.json('data')),
    });

    const created = http.post(
        `${baseUrl}/todos`,
        JSON.stringify({ title: `k6-${__VU}-${__ITER}` }),
        { headers: { 'Content-Type': 'application/json' } },
    );
    if (!check(created, {
        'POST /todos returns 201': (response) => response.status === 201,
    })) {
        return;
    }

    const id = created.json('data._id');
    if (typeof id !== 'string' || id.length === 0) {
        fail('POST /todos response did not include data._id');
    }

    const todo = http.get(`${baseUrl}/todos/${id}`);
    check(todo, {
        'GET /todos/:id returns 200': (response) => response.status === 200,
    });

    const updated = http.patch(`${baseUrl}/todos/${id}/done`);
    check(updated, {
        'PATCH /todos/:id/done marks todo done': (response) =>
            response.status === 200 && response.json('data.done') === true,
    });

    const deleted = http.del(`${baseUrl}/todos/${id}`);
    check(deleted, {
        'DELETE /todos/:id returns 204': (response) => response.status === 204,
    });
}

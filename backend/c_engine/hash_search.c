/*
 * FindX - Hash Table Search Engine (C Implementation)
 * Uses separate chaining with linked lists.
 * Reads users from JSON input via stdin, performs search,
 * and outputs structured JSON trace to stdout.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define TABLE_SIZE 16
#define MAX_USERNAME 128
#define MAX_NAME 256
#define MAX_BIO 512
#define MAX_EMAIL 256
#define MAX_PHOTO 512

/* ── Data structures ─────────────────────────────────────── */

typedef struct User {
    char username[MAX_USERNAME];
    char display_name[MAX_NAME];
    char email[MAX_EMAIL];
    char bio[MAX_BIO];
    char photo_url[MAX_PHOTO];
    int  id;
} User;

typedef struct Node {
    User user;
    struct Node *next;
} Node;

typedef struct {
    Node *buckets[TABLE_SIZE];
    int   count;
} HashTable;

/* ── Hash function ───────────────────────────────────────── */

unsigned int hash_username(const char *username) {
    unsigned int hash = 5381;
    int c;
    while ((c = (unsigned char)*username++) != '\0') {
        hash = ((hash << 5) + hash) + tolower(c);  /* hash * 33 + c */
    }
    return hash;
}

unsigned int bucket_index(const char *username) {
    return hash_username(username) % TABLE_SIZE;
}

/* ── Hash table operations ───────────────────────────────── */

HashTable* ht_create(void) {
    HashTable *ht = (HashTable*)calloc(1, sizeof(HashTable));
    return ht;
}

void ht_insert(HashTable *ht, const User *u) {
    unsigned int idx = bucket_index(u->username);
    Node *node = (Node*)malloc(sizeof(Node));
    node->user = *u;
    node->next = ht->buckets[idx];
    ht->buckets[idx] = node;
    ht->count++;
}

void ht_destroy(HashTable *ht) {
    for (int i = 0; i < TABLE_SIZE; i++) {
        Node *cur = ht->buckets[i];
        while (cur) {
            Node *tmp = cur;
            cur = cur->next;
            free(tmp);
        }
    }
    free(ht);
}

/* ── JSON output helpers ─────────────────────────────────── */

static void json_escape(const char *src, char *dst, int dstsz) {
    int j = 0;
    for (int i = 0; src[i] && j < dstsz - 2; i++) {
        switch (src[i]) {
            case '"':  dst[j++]='\\'; dst[j++]='"';  break;
            case '\\': dst[j++]='\\'; dst[j++]='\\'; break;
            case '\n': dst[j++]='\\'; dst[j++]='n';  break;
            case '\r': dst[j++]='\\'; dst[j++]='r';  break;
            case '\t': dst[j++]='\\'; dst[j++]='t';  break;
            default:   dst[j++]=src[i];
        }
    }
    dst[j]='\0';
}

/* ── Bucket snapshot ─────────────────────────────────────── */

static void print_bucket_snapshot(HashTable *ht) {
    printf("[");
    for (int i = 0; i < TABLE_SIZE; i++) {
        printf("{\"index\":%d,\"nodes\":[", i);
        Node *cur = ht->buckets[i];
        int first = 1;
        while (cur) {
            char eu[MAX_USERNAME*2], en[MAX_NAME*2];
            json_escape(cur->user.username, eu, sizeof(eu));
            json_escape(cur->user.display_name, en, sizeof(en));
            if (!first) printf(",");
            printf("{\"username\":\"%s\",\"display_name\":\"%s\"}", eu, en);
            first = 0;
            cur = cur->next;
        }
        printf("]}");
        if (i < TABLE_SIZE - 1) printf(",");
    }
    printf("]");
}

/* ── Linear search for comparison ───────────────────────── */

typedef struct {
    int found;
    int comparisons;
    User user;
} LinearResult;

static LinearResult linear_search(HashTable *ht, const char *target) {
    LinearResult res = {0, 0, {{0}}};
    char tl[MAX_USERNAME];
    int i;
    for (i = 0; target[i] && i < MAX_USERNAME-1; i++)
        tl[i] = (char)tolower((unsigned char)target[i]);
    tl[i] = '\0';

    for (int b = 0; b < TABLE_SIZE; b++) {
        Node *cur = ht->buckets[b];
        while (cur) {
            res.comparisons++;
            char ul[MAX_USERNAME];
            int j;
            for (j = 0; cur->user.username[j] && j < MAX_USERNAME-1; j++)
                ul[j] = (char)tolower((unsigned char)cur->user.username[j]);
            ul[j] = '\0';
            if (strcmp(tl, ul) == 0) {
                res.found = 1;
                res.user  = cur->user;
                return res;
            }
            cur = cur->next;
        }
    }
    return res;
}

/* ── Simple JSON parser helpers ──────────────────────────── */

static char* skip_ws(char *p) {
    while (*p && (*p==' '||*p=='\t'||*p=='\n'||*p=='\r')) p++;
    return p;
}

static char* parse_string(char *p, char *out, int outsz) {
    p = skip_ws(p);
    if (*p != '"') return p;
    p++;
    int i = 0;
    while (*p && *p != '"' && i < outsz - 1) {
        if (*p == '\\') {
            p++;
            switch (*p) {
                case '"':  out[i++]='"';  break;
                case '\\': out[i++]='\\'; break;
                case 'n':  out[i++]='\n'; break;
                case 'r':  out[i++]='\r'; break;
                case 't':  out[i++]='\t'; break;
                default:   out[i++]=*p;
            }
        } else {
            out[i++] = *p;
        }
        p++;
    }
    out[i] = '\0';
    if (*p == '"') p++;
    return p;
}

static char* find_key(char *p, const char *key) {
    char buf[256];
    snprintf(buf, sizeof(buf), "\"%s\"", key);
    char *f = strstr(p, buf);
    if (!f) return NULL;
    f += strlen(buf);
    f = skip_ws(f);
    if (*f == ':') f++;
    return f;
}

/* ── Hash calculation trace ──────────────────────────────── */

static void print_hash_trace(const char *username) {
    printf("\"hash_trace\":{");
    printf("\"username\":\"%s\",", username);
    printf("\"steps\":[");

    unsigned int hash = 5381;
    int first = 1;
    for (int i = 0; username[i]; i++) {
        char c = (char)tolower((unsigned char)username[i]);
        unsigned int prev_hash = hash;
        hash = ((hash << 5) + hash) + (unsigned char)c;

        if (!first) printf(",");
        printf("{\"char\":\"%c\",\"ascii\":%d,\"prev_hash\":%u,\"new_hash\":%u}",
               username[i], (unsigned char)username[i], prev_hash, hash);
        first = 0;
    }

    printf("],");
    printf("\"final_hash\":%u,", hash);
    printf("\"table_size\":%d,", TABLE_SIZE);
    printf("\"bucket_index\":%u", hash % TABLE_SIZE);
    printf("}");
}

/* ── Main search and trace generation ───────────────────── */

int main(int argc, char *argv[]) {
    /* Read entire stdin */
    char *input = NULL;
    size_t input_size = 0, input_cap = 4096;
    input = (char*)malloc(input_cap);
    if (!input) { fprintf(stderr, "OOM\n"); return 1; }

    int ch;
    while ((ch = fgetc(stdin)) != EOF) {
        if (input_size + 1 >= input_cap) {
            input_cap *= 2;
            char *tmp = (char*)realloc(input, input_cap);
            if (!tmp) { free(input); return 1; }
            input = tmp;
        }
        input[input_size++] = (char)ch;
    }
    input[input_size] = '\0';

    /* Parse "target" */
    char target[MAX_USERNAME] = {0};
    char *tp = find_key(input, "target");
    if (!tp) {
        printf("{\"error\":\"missing target\"}");
        free(input);
        return 1;
    }
    parse_string(tp, target, sizeof(target));

    /* Parse "users" array */
    HashTable *ht = ht_create();
    char *up = strstr(input, "\"users\"");
    if (up) {
        up = strchr(up, '[');
        while (up && *up) {
            up = strchr(up, '{');
            if (!up) break;

            User u; memset(&u, 0, sizeof(u));
            char *kp;

            kp = find_key(up, "username");
            if (kp) { char tmp[MAX_USERNAME]; parse_string(kp, tmp, sizeof(tmp)); strncpy(u.username, tmp, MAX_USERNAME-1); }

            kp = find_key(up, "display_name");
            if (kp) { char tmp[MAX_NAME]; parse_string(kp, tmp, sizeof(tmp)); strncpy(u.display_name, tmp, MAX_NAME-1); }

            kp = find_key(up, "email");
            if (kp) { char tmp[MAX_EMAIL]; parse_string(kp, tmp, sizeof(tmp)); strncpy(u.email, tmp, MAX_EMAIL-1); }

            kp = find_key(up, "bio");
            if (kp) { char tmp[MAX_BIO]; parse_string(kp, tmp, sizeof(tmp)); strncpy(u.bio, tmp, MAX_BIO-1); }

            kp = find_key(up, "photo_url");
            if (kp) { char tmp[MAX_PHOTO]; parse_string(kp, tmp, sizeof(tmp)); strncpy(u.photo_url, tmp, MAX_PHOTO-1); }

            kp = find_key(up, "id");
            if (kp) { kp = skip_ws(kp); u.id = atoi(kp); }

            if (u.username[0]) ht_insert(ht, &u);

            /* Move past this object */
            char *close = strchr(up + 1, '}');
            if (!close) break;
            up = close + 1;
        }
    }

    /* --- Perform hash search with trace --- */
    unsigned int h = hash_username(target);
    unsigned int bidx = h % TABLE_SIZE;
    Node *chain = ht->buckets[bidx];

    /* Build trace steps */
    printf("{");

    /* Hash calculation trace */
    print_hash_trace(target);
    printf(",");

    /* Bucket snapshot */
    printf("\"bucket_snapshot\":");
    print_bucket_snapshot(ht);
    printf(",");

    /* Search trace */
    printf("\"search\":{");
    printf("\"target\":\"%s\",", target);
    printf("\"hash\":%u,", h);
    printf("\"bucket_index\":%u,", bidx);
    printf("\"table_size\":%d,", TABLE_SIZE);
    printf("\"steps\":[");

    int step = 0;
    int found = 0;
    int comparisons = 0;
    User found_user; memset(&found_user, 0, sizeof(found_user));

    /* Step 0: Begin */
    printf("{\"step\":%d,\"type\":\"begin\",\"message\":\"Starting hash table search for username '%s'\",\"bucket_index\":%u,\"node\":null,\"match\":false}",
           step++, target, bidx);

    /* Step 1: Hash calculated */
    printf(",{\"step\":%d,\"type\":\"hash_calculated\",\"message\":\"Hash value computed: %u, Bucket index: %u\",\"bucket_index\":%u,\"node\":null,\"match\":false}",
           step++, h, bidx, bidx);

    /* Step 2: Bucket selected */
    printf(",{\"step\":%d,\"type\":\"bucket_selected\",\"message\":\"Jumping to bucket[%u] to start traversal\",\"bucket_index\":%u,\"node\":null,\"match\":false}",
           step++, bidx, bidx);

    if (chain == NULL) {
        /* Step 3: Empty bucket */
        printf(",{\"step\":%d,\"type\":\"bucket_empty\",\"message\":\"Bucket[%u] is empty — user not found\",\"bucket_index\":%u,\"node\":null,\"match\":false}",
               step++, bidx, bidx);
    } else {
        Node *cur = chain;
        while (cur) {
            comparisons++;
            char eu[MAX_USERNAME*2], en[MAX_NAME*2], ep[MAX_PHOTO*2];
            json_escape(cur->user.username, eu, sizeof(eu));
            json_escape(cur->user.display_name, en, sizeof(en));
            json_escape(cur->user.photo_url, ep, sizeof(ep));

            int match = (strcasecmp(cur->user.username, target) == 0);

            printf(",{\"step\":%d,\"type\":\"compare\",\"message\":\"Comparing '%s' with node '%s' — %s\",\"bucket_index\":%u,\"node\":{\"username\":\"%s\",\"display_name\":\"%s\",\"photo_url\":\"%s\"},\"match\":%s,\"comparison_number\":%d}",
                   step++,
                   target, cur->user.username,
                   match ? "MATCH FOUND!" : "no match",
                   bidx,
                   eu, en, ep,
                   match ? "true" : "false",
                   comparisons);

            if (match) {
                found = 1;
                found_user = cur->user;
                break;
            }
            cur = cur->next;
        }
    }

    /* Final step */
    if (found) {
        char eu[MAX_USERNAME*2], en[MAX_NAME*2], eb[MAX_BIO*2], ep[MAX_PHOTO*2], ee[MAX_EMAIL*2];
        json_escape(found_user.username, eu, sizeof(eu));
        json_escape(found_user.display_name, en, sizeof(en));
        json_escape(found_user.bio, eb, sizeof(eb));
        json_escape(found_user.photo_url, ep, sizeof(ep));
        json_escape(found_user.email, ee, sizeof(ee));

        printf(",{\"step\":%d,\"type\":\"found\",\"message\":\"Search complete — user '%s' found after %d comparison(s)\",\"bucket_index\":%u,\"node\":{\"username\":\"%s\",\"display_name\":\"%s\",\"photo_url\":\"%s\"},\"match\":true}",
               step++, target, comparisons, bidx, eu, en, ep);

        printf("],\"result\":\"found\",\"comparisons\":%d,", comparisons);
        printf("\"user\":{\"username\":\"%s\",\"display_name\":\"%s\",\"email\":\"%s\",\"bio\":\"%s\",\"photo_url\":\"%s\",\"id\":%d}",
               eu, en, ee, eb, ep, found_user.id);
    } else {
        printf(",{\"step\":%d,\"type\":\"not_found\",\"message\":\"Search complete — '%s' not found in bucket[%u] after %d comparison(s)\",\"bucket_index\":%u,\"node\":null,\"match\":false}",
               step++, target, bidx, comparisons, bidx);
        printf("],\"result\":\"not_found\",\"comparisons\":%d,\"user\":null", comparisons);
    }

    printf("}"); /* close search */

    /* Linear search comparison */
    LinearResult lr = linear_search(ht, target);
    printf(",\"linear_search\":{\"comparisons\":%d,\"result\":\"%s\"}",
           lr.comparisons, lr.found ? "found" : "not_found");

    printf("}"); /* close root */

    ht_destroy(ht);
    free(input);
    return 0;
}

WITH json_tags AS (
  SELECT
    x. "tagId",
    row_to_json(x) AS tag
  FROM (
    SELECT
      tag_id "tagId",
      tag
    FROM
      tags) x
),
required_tags AS (
  SELECT
    tags.tag_id
  FROM (
    SELECT
      unnest($1::text[]) AS tag) AS t (tag)
      INNER JOIN tags ON tags.tag = t.tag
),
excluded_tags AS (
  SELECT
    tags.tag_id
  FROM (
    SELECT
      unnest($2::text[]) AS tag) AS t (tag)
    INNER JOIN tags ON tags.tag = t.tag)
--select * from json_tags
SELECT
  c.card_id "cardId",
  c.front,
  c.back,
  c.hint,
  coalesce(array_agg(jt.tag) FILTER (WHERE jt.tag IS NOT NULL), ARRAY[]::json[]) AS tags
FROM
  cards c
  LEFT JOIN card_tags ct ON c.card_id = ct.card_id
  LEFT JOIN json_tags jt ON ct.tag_id = jt. "tagId"
  LEFT JOIN excluded_tags et ON ct.tag_id = et.tag_id
  LEFT JOIN required_tags rt ON ct.tag_id = rt.tag_id
GROUP BY
  c.card_id
HAVING
  count(et.tag_id) = 0
  AND count(rt.tag_id) = cardinality($1::text[])
  AND (nullif ($3::text,
      '(none)') IS NULL
    OR c.card_id = $3::int)
  AND (nullif ($4::text,
      '(none)') IS NULL
    OR c.front = $4::text)
  AND (nullif ($5::text,
      '(none)') IS NULL
    OR c.back = $5::text)
  AND (nullif ($6::text,
      '(none)') IS NULL
    OR c.hint = $6::text)
ORDER BY
  c.card_id
LIMIT $7 OFFSET $8

WITH RECURSIVE parent_tags AS (
  SELECT
    t.tag,
    ct.tag_id,
    c.parent_id,
    TRUE "isInherited"
  FROM
    category_tags ct
    INNER JOIN categories c ON ct.category_id = c.category_id
    INNER JOIN tags t ON ct.tag_id = t.tag_id
  WHERE
    c.category_id = $1
  UNION
  SELECT
    t.tag,
    ct.tag_id,
    c.parent_id,
    TRUE "isInherited"
  FROM
    parent_tags pt
    INNER JOIN category_tags ct ON pt.parent_id = ct.category_id
    INNER JOIN tags t ON t.tag_id = ct.tag_id
    INNER JOIN categories c ON c.category_id = ct.category_id
),
category AS (
  UPDATE
    categories
  SET
    parent_id = $1,
    name = $2
  WHERE
    category_id = $3
  RETURNING
    parent_id,
    name
),
child_tags AS (
  SELECT
    u.tag,
    t.tag_id,
    FALSE "isInherited"
  FROM (
    SELECT
      *
    FROM
      unnest($4::text[]) tag) u
  LEFT JOIN tags t ON t.tag = u.tag
  LEFT JOIN parent_tags pt ON pt.tag_id = t.tag_id
WHERE
  pt.tag_id IS NULL
),
insert_tags AS (
INSERT INTO tags (tag)
  SELECT
    tag
  FROM
    child_tags ct
  WHERE
    ct.tag_id IS NULL
  RETURNING
    tag,
    tag_id,
    FALSE "isInherited"
),
combined_tags AS (
  SELECT
    pt.tag,
    pt.tag_id "tagId",
    pt. "isInherited"
  FROM
    parent_tags pt
  UNION
  SELECT
    ct.tag,
    ct.tag_id "tagId",
    ct. "isInherited"
  FROM
    child_tags ct
  WHERE
    ct.tag_id IS NOT NULL
  UNION
  SELECT
    it.tag,
    it.tag_id "tagId",
    it. "isInherited"
  FROM
    insert_tags it
),
insert_category_tags AS (
INSERT INTO category_tags (category_id, tag_id)
  SELECT
    $3,
    ct. "tagId"
  FROM
    combined_tags ct
  LEFT JOIN child_tags ch ON ct.tag = ch.tag
WHERE
  ch.tag IS NOT NULL
),
delete_tags AS (
  DELETE FROM category_tags ct1 USING category_tags ct2
  LEFT JOIN child_tags ch ON ct2.tag_id = ch.tag_id
  WHERE ct1.category_id = $3
    AND ct1.category_id = ct2.category_id
    AND ch.tag_id IS NULL
)
SELECT
  $3 "categoryId", c.name, c.parent_id "parentId", coalesce((
    SELECT
      array_agg(row_to_json(x))
      FROM (
        SELECT
          * FROM combined_tags
        ORDER BY
          "tagId") x), ARRAY[]::json[]) tags
FROM
  category c

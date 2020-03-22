WITH RECURSIVE parent_tags AS (
  SELECT
    ct.tag_id,
    c.parent_id
  FROM
    category_tags ct
    INNER JOIN categories c ON ct.category_id = c.category_id
  WHERE
    c.category_id = $1
  UNION
  SELECT
    ct.tag_id,
    c.parent_id
  FROM
    parent_tags pt
    INNER JOIN category_tags ct ON pt.parent_id = ct.category_id
    INNER JOIN categories c ON c.category_id = ct.category_id
),
insert_category AS (
INSERT INTO categories (parent_id, name)
    VALUES ($1, $2)
  RETURNING
    category_id
), input_tags AS (
  SELECT
    i.tag,
    t.tag_id
  FROM (
    SELECT
      unnest($3::text[]) tag) i
    LEFT JOIN tags t ON i.tag = t.tag
),
filtered_tags AS (
  SELECT
    it.tag,
    it.tag_id
  FROM
    input_tags it
    LEFT JOIN parent_tags pt ON pt.tag_id = it.tag_id
  WHERE
    pt.tag_id IS NULL
),
insert_tags AS (
INSERT INTO tags (tag)
  SELECT
    ft.tag
  FROM
    filtered_tags ft
  WHERE
    ft.tag_id IS NULL
  RETURNING
    tag,
    tag_id
),
child_tags AS (
  SELECT
    it.tag,
    it.tag_id
  FROM
    insert_tags it
  UNION
  SELECT
    ft.tag,
    ft.tag_id
  FROM
    filtered_tags ft
  WHERE
    ft.tag_id IS NOT NULL
),
insert_category_tags AS (
INSERT INTO category_tags (category_id, tag_id)
  SELECT
    ic.category_id,
    ct.tag_id
  FROM
    insert_category ic,
    child_tags ct
),
combined_tags AS (
  SELECT
    ct.tag,
    ct.tag_id "tagId",
    FALSE "isInherited"
  FROM
    child_tags ct
  UNION
  SELECT
    i.tag,
    i.tag_id "tagId",
    TRUE "isInherited"
  FROM
    input_tags i
    INNER JOIN parent_tags pt ON i.tag_id = pt.tag_id
)
SELECT
  ic.category_id,
  coalesce((
    SELECT
      array_agg(row_to_json(x))
    FROM (
      SELECT
        * FROM combined_tags
      ORDER BY
        "tagId") x), ARRAY[]::json[]) tags
FROM
  insert_category ic

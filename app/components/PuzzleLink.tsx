import { useState, useEffect, useContext, ReactNode } from 'react';

import { Link } from './Link';
import { AuthContext } from './AuthContext';
import { getPossiblyStalePlay } from '../lib/plays';
import { PuzzleResult } from '../lib/types';
import { SMALL_AND_UP } from '../lib/style';
import { PuzzleSizeIcon } from '../components/Icons';
import { Emoji } from '../components/Emoji';
import { pastDistanceToNow, timeString } from '../lib/utils';
import { PlayWithoutUserT } from '../lib/dbtypes';
import { ConstructorPageT } from '../lib/constructorPage';
import { Markdown } from './Markdown';

const PuzzleLink = (props: {
  showingBlog: boolean;
  id: string;
  authorId: string;
  width?: number;
  height?: number;
  title: string;
  subTitle?: string;
  children?: ReactNode;
}) => {
  const { user } = useContext(AuthContext);
  const [play, setPlay] = useState<PlayWithoutUserT | null>(null);
  const authored = user?.uid === props.authorId;

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      const p = await getPossiblyStalePlay(user, props.id);
      if (ignore) {
        return;
      }
      setPlay(p);
    }
    fetchData();
    return () => {
      ignore = true;
    };
  }, [user, props.id]);

  const linkCss = {
    color:
      authored || (play && play.f)
        ? 'var(--text)'
        : play
          ? 'var(--error)'
          : 'var(--link)',
    '&:hover': {
      color:
        authored || (play && play.f)
          ? 'var(--text)'
          : play
            ? 'var(--error-hover)'
            : 'var(--link-hover)',
    },
  };

  return (
    <div
      css={{
        marginBottom: props.showingBlog ? 0 : '1.5em',
        display: 'inline-flex',
        alignItems: 'flex-start',
        width: '100%',
        [SMALL_AND_UP]: {
          width: props.showingBlog ? '100%' : '50%',
        },
      }}
    >
      <Link
        css={[
          linkCss,
          {
            marginRight: '0.3em',
            fontSize: '4em',
            lineHeight: '1em',
          },
        ]}
        href={`/crosswords/${props.id}`}
      >
        <div css={{ position: 'relative' }}>
          <PuzzleSizeIcon width={props.width} height={props.height} />
          {authored || (play && play.f) ? (
            <div
              css={{
                textShadow:
                  '2px 0 0 white, -2px 0 0 white, 0 2px 0 white, 0 -2px 0 white',
                position: 'absolute',
                top: 0,
                width: '1.66em',
                textAlign: 'center',
                left: 0,
                fontSize: '0.6em',
              }}
            >
              {authored ? (
                <Emoji title="Authored Puzzle" symbol="🖋️" />
              ) : play && play.ch ? (
                <Emoji title="Used helpers" symbol="😏" />
              ) : (
                <Emoji title="Solved without helpers" symbol="🤓" />
              )}
            </div>
          ) : (
            ''
          )}
        </div>
      </Link>
      <div css={{ flex: 1 }}>
        <Link css={linkCss} href={`/crosswords/${props.id}`}>
          <h3
            css={{
              marginBottom: 0,
            }}
          >
            {props.title}{' '}
            {!authored && play ? (
              play.f ? (
                <i>({timeString(play.t, false)})</i>
              ) : (
                <i>(unfinished)</i>
              )
            ) : (
              ''
            )}
          </h3>
          {props.subTitle ? (
            <h4
              css={{
                marginBottom: 0,
              }}
            >
              {props.subTitle}
            </h4>
          ) : (
            ''
          )}
        </Link>
        {props.children}
      </div>
    </div>
  );
};

export const AuthorLink = ({
  authorName,
  constructorPage,
  guestConstructor,
}: {
  authorName: string;
  constructorPage: ConstructorPageT | null;
  guestConstructor: string | null;
}) => {
  let link: ReactNode = authorName;
  if (constructorPage) {
    const username = constructorPage.i || constructorPage.id;
    link = <Link href={'/' + username}>{constructorPage.n}</Link>;
  }
  if (guestConstructor) {
    return (
      <>
        By {guestConstructor} · Published by {link}
      </>
    );
  }
  return <>By {link}</>;
};

export const PuzzleResultLink = ({
  puzzle,
  showDate,
  showBlogPost,
  showAuthor,
  constructorPage,
  title,
}: {
  puzzle: PuzzleResult;
  showDate?: boolean;
  showBlogPost?: boolean;
  showAuthor: boolean;
  title?: string;
  constructorPage?: ConstructorPageT | null;
}) => {
  const authorLink = (
    <AuthorLink
      authorName={puzzle.authorName}
      guestConstructor={puzzle.guestConstructor}
      constructorPage={constructorPage || null}
    />
  );
  const publishDate = puzzle.isPrivateUntil
    ? new Date(puzzle.isPrivateUntil)
    : new Date(puzzle.publishTime);
  const date = (
    <span title={publishDate.toISOString()}>
      Published {pastDistanceToNow(publishDate)}
    </span>
  );
  let contents: ReactNode = null;
  if (showDate && showAuthor) {
    contents = (
      <p>
        {authorLink} · {date}
      </p>
    );
  } else if (puzzle.guestConstructor && showDate) {
    contents = (
      <p>
        By guest constructor {puzzle.guestConstructor} · {date}
      </p>
    );
  } else if (showDate) {
    contents = <p>{date}</p>;
  } else if (showAuthor) {
    contents = <p>{authorLink}</p>;
  } else if (puzzle.guestConstructor) {
    contents = <p>By guest constructor {puzzle.guestConstructor}</p>;
  }
  return (
    <>
      <PuzzleLink
        showingBlog={showBlogPost && puzzle.blogPost ? true : false}
        authorId={puzzle.authorId}
        id={puzzle.id}
        width={puzzle.size.cols}
        height={puzzle.size.rows}
        title={title || puzzle.title}
        subTitle={title ? puzzle.title : undefined}
      >
        {contents}
      </PuzzleLink>
      {showBlogPost && puzzle.blogPost ? (
        <div css={{ width: '100%', marginBottom: '2em' }}>
          <Markdown text={puzzle.blogPost} preview={250} />
        </div>
      ) : (
        ''
      )}
    </>
  );
};

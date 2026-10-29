import type {
  GetStaticProps,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'node:querystring';

export const QS_DELIMITER = '__qs__';

// Gộp query params từ request gốc vào destination của ISR redirect
function mergeDestinationWithQuery(
  destination: string,
  rawQuery: string,
): string {
  if (!rawQuery) return destination;
  const [basePath, existingQuery] = destination.split('?');
  const mergedParams = new URLSearchParams(existingQuery ?? '');
  const incomingParams = new URLSearchParams(rawQuery);

  incomingParams.forEach((value, key) => {
    mergedParams.set(key, value);
  });

  const queryString = mergedParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

// Tách query params đã được middleware nhúng vào bất kỳ dynamic param nào ([slug], [id], [...slug])
function extractQueryFromParams(params?: ParsedUrlQuery): {
  cleanParams?: ParsedUrlQuery;
  incomingQuery: string;
} {
  if (!params) return { cleanParams: undefined, incomingQuery: '' };

  const cleanParams: ParsedUrlQuery = { ...params };
  let incomingQuery = '';

  for (const [key, value] of Object.entries(cleanParams)) {
    if (typeof value === 'string' && value.includes(QS_DELIMITER)) {
      const [cleanVal, encodedQs = ''] = value.split(QS_DELIMITER);
      cleanParams[key] = cleanVal;
      incomingQuery = decodeURIComponent(encodedQs);
    } else if (Array.isArray(value) && value.length > 0) {
      const lastIdx = value.length - 1;
      const lastVal = value[lastIdx];
      if (lastVal.includes(QS_DELIMITER)) {
        const [cleanVal, encodedQs = ''] = lastVal.split(QS_DELIMITER);
        const nextArr = [...value];
        nextArr[lastIdx] = cleanVal;
        cleanParams[key] = nextArr;
        incomingQuery = decodeURIComponent(encodedQs);
      }
    }
  }

  return { cleanParams, incomingQuery };
}

// Higher-Order Function bọc ngoài getStaticProps để tự động giữ lại query params khi redirect trên mọi trang ISR
export function withIsrQueryRedirect<
  Props extends { [key: string]: any },
  Params extends ParsedUrlQuery = ParsedUrlQuery,
>(handler: GetStaticProps<Props, Params>): GetStaticProps<Props, Params> {
  return async (
    context: GetStaticPropsContext<Params>,
  ): Promise<GetStaticPropsResult<Props>> => {
    const { cleanParams, incomingQuery } = extractQueryFromParams(
      context.params,
    );

    const result = await handler({
      ...context,
      params: cleanParams as Params | undefined,
    });

    if ('redirect' in result && incomingQuery) {
      return {
        ...result,
        redirect: {
          ...result.redirect,
          destination: mergeDestinationWithQuery(
            result.redirect.destination,
            incomingQuery,
          ),
        },
      };
    }

    return result;
  };
}

import requests
import re
from bs4 import BeautifulSoup
from urllib.parse import urlparse

REDDIT_POST_PER_PAGE = 25

def getUrlHost(url):
    parsedUrl = urlparse(url)
    urlHost = '{uri.scheme}://{uri.netloc}/'.format(uri=parsedUrl)

    return urlHost

def getPageUrl(url, pageIdx, lastPostTag):
    if 0 == pageIdx:
        return url
    else:
        return url + '?count=' + str(REDDIT_POST_PER_PAGE*pageIdx) + '&'\
                   + 'after=' + lastPostTag

def getLastPostTag(sourceTags):
    tagPrefix = 't3_'
    lastPostTag = ''
    lastPost = sourceTags[-1].find(class_='reportform')
    clsList = lastPost.get('class')



    for cls in clsList:
        tagIdx = cls.find(tagPrefix)
        if -1 != tagIdx:
            lastPostTag = cls[tagIdx:]

    return lastPostTag

def getCommentCnt(commentTag):
    return commentTag.string.split()[0]

def getPostUpvote(tag):
    return tag.parent.parent.find(class_='score unvoted').string

def filterData(source, filterParam, pageIdx):
    filteredTags = []
    sourceTags = source.find_all(class_='top-matter')
    lastPostTag = getLastPostTag(sourceTags)

    for tag in sourceTags:
        # {0} is a placeholder adding {1} will add another placeholder
        title = tag.find(class_='title', string=re.compile('.*{0}.*'.format('|'.join(filterParam['keywords'])), re.I))
        if title:
            linkTag = tag.find(class_='comments')
            filteredTags.append({
                'title': title.string,
                'upvote': getPostUpvote(tag),
                'comments': getCommentCnt(linkTag),
                'link': linkTag.get('href'),
                'page': pageIdx + 1
            })

    return filteredTags, lastPostTag

def printData(dataList):
    for data in dataList:
        for key, value in data.items():
            print(str(key) + ':' + str(value))
        print('=' * 25)

def main():
    url = 'https://old.reddit.com/r/Python/'
    pageLimit = 5
    lastPostTag = ''
    reqDataList = []
    filter = {
        'keywords' : ['python', 'machine', 'analy']
    }

    for pageIdx in range(pageLimit):
        pageUrl = getPageUrl(url, pageIdx, lastPostTag)
        request = requests.get(pageUrl, headers={'User-agent': 'IM NOT A BOT'})
        request.encoding = 'utf-8'
        # when success, responseCode = 200
        responseCode = request.status_code

        if  requests.codes.ok == responseCode:
            soup = BeautifulSoup(request.text, 'html.parser')
            requestData, lastPostTag = filterData(soup, filter, pageIdx)
            reqDataList += requestData
        else:
            print("Error: " + str(responseCode))

    printData(reqDataList)

if __name__ == '__main__':
     main()
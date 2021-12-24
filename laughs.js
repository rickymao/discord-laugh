const laughList = [
    'https://www.youtube.com/watch?v=iYVO5bUFww0', 
    'https://www.youtube.com/watch?v=4B06Bh3i8Ms&list=PLkNE0ct3FIjMS-bDdB2uE8DATQGg9dnrm&index=3',
    'https://www.youtube.com/watch?v=GDREV9H4ats&list=PLkNE0ct3FIjMS-bDdB2uE8DATQGg9dnrm&index=7',
    'https://www.youtube.com/watch?v=w0E3rEy4YPQ&list=PLkNE0ct3FIjMS-bDdB2uE8DATQGg9dnrm&index=2',
    'https://www.youtube.com/watch?v=3LG9A7fUrPs&list=PLkNE0ct3FIjMS-bDdB2uE8DATQGg9dnrm&index=1'
]

exports.getRandomLaugh = () => {
    const randomIdx = Math.floor(Math.random() * (laughList.length));
    return laughList[randomIdx];
}

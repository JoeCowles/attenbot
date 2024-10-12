import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
  } from '@react-email/components';
  import * as React from 'react';
  
  interface Video {
    title: string;
    thumbnailBase64: string;
  }
  
  interface WeeklyReportEmailProps {
    parentName: string;
    studentName: string;
    videos: Video[];
    reportUrl: string;
  }
  
  export const WeeklyReportEmail = ({
    parentName = 'Sarah',
    studentName = 'Alex',
    videos = [
      {
        title: 'Introduction to Algebra',
        thumbnailBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
      },
      {
        title: 'The Water Cycle Explained',
        thumbnailBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
      },
      {
        title: 'World War II: Key Events',
        thumbnailBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==',
      },
    ],
    reportUrl = 'https://example.com/report',
  }: WeeklyReportEmailProps) => {
    const maxVideos = 3;
  
    return (
      <Html>
        <Head />
        <Preview>Weekly Youtube Report for {studentName}</Preview>
        <Body style={main}>
          <Container style={container}>
            <Heading style={h1}>Weekly Youtube Report</Heading>
            <Text style={text}>
              Hello {parentName},
            </Text>
            <Text style={text}>
              {studentName}'s weekly learning report is now available. Here's a glimpse of what {studentName} has been watching:
            </Text>
            <Section style={videoList}>
              {videos.slice(0, maxVideos).map((video, index) => (
                <div key={index} style={videoCard}>
                  <Img
                    src={video.thumbnailBase64}
                    width={120}
                    height={68}
                    alt={video.title}
                    style={thumbnail}
                  />
                  <Text style={videoTitle}>{video.title}</Text>
                </div>
              ))}
              <div style={fadedCard}>
                <Text style={fadedText}>More videos...</Text>
              </div>
            </Section>
            <Section style={buttonContainer}>
              <Button style={{...button, padding: '12px'}} href={reportUrl}>
                View Full Report
              </Button>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  };
  
  export default WeeklyReportEmail;
  
  const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  };
  
  const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
  };
  
  const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '30px 0',
  };
  
  const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'left' as const,
  };
  
  const videoList = {
    margin: '32px 0',
  };
  
  const videoCard = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  };
  
  const thumbnail = {
    borderRadius: '4px',
    marginRight: '12px',
  };
  
  const videoTitle = {
    color: '#333',
    fontSize: '14px',
    fontWeight: 'bold',
  };
  
  const fadedCard = {
    backgroundColor: '#f6f9fc',
    borderRadius: '4px',
    padding: '16px',
    textAlign: 'center' as const,
  };
  
  const fadedText = {
    color: '#999',
    fontSize: '14px',
  };
  
  const buttonContainer = {
    textAlign: 'center' as const,
    marginTop: '32px',
  };
  
  const button = {
    backgroundColor: '#5469d4',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '16px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
  };

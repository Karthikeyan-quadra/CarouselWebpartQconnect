//Carouselbanner.tsx
import * as React from "react";
import styles from './Carouselbanner.module.scss';
import { ICarouselbannerProps } from "./ICarouselbannerProps";
import { useEffect, useState, Fragment, useRef } from "react";
import { Button, Carousel, Drawer, Form, Input, Popconfirm, Space, Table, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { message } from "antd";

// import { Upload } from "antd";

import "antd/dist/reset.css";
import { Adding, Fetch } from "../helpers/Service";
import { EditItem, DeleteItem } from "../helpers/Service";

interface Item {
  key: string;
  Title: string;
  URL: string;
  AttachmentFiles: any[];
}


export default function Carouselbanner(props: ICarouselbannerProps) {

  const slider: any = useRef(null);

  const [title, setTitle] = useState<string>("");
  const [image, setImage] = useState<File | null>(null); // Use File type for image state
  const [url, setUrl] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>(""); (null);
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [isOpenArray, setIsOpenArray] = React.useState(Array(fetchedData.length).fill(false));
  const [open, setOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | number>("");
  // const [editingRow, setEditingRow] = useState<string | number>("");
  // const [form] = Form.useForm();
  const [editForm] = Form.useForm(); // Create a separate form for editing
  const fileInputRef = useRef<any>(null);



  const isEditing = (record: Item) => record.key === editingKey;


  const edit = (record: Item) => {
    setEditingKey(record.key);
  };


  

  const cancel = () => {
    setEditingKey("");
  };

  useEffect(() => {
    const email = props.context.pageContext.user.email;
    setUserEmail(email);

    handleFetchData();
  }, [props.context.pageContext.user.email]);



  const onClose = () => {
    setOpen(false);
  };

  type ColumnTypes = any;


  // const handleSave = async (record: any) => {
  //   try {
  //     const row = await form.validateFields();
  //     const newData = [...fetchedData];
  //     const index = newData.findIndex((item) => record.key === item.key);

  //     if (index > -1) {
  //       const item = newData[index];
  //       // Update the item with the new data
  //       newData.splice(index, 1, { ...item, ...row });
  //       setFetchedData(newData);
  //       setEditingKey("");
  //     }
  //   } catch (error) {
  //     console.error("Error saving item:", error);
  //   }
  // };

  // const handleSave = async (record: Item) => {
  //   try {
  //     const newData = [...fetchedData];
  //     const index = newData.findIndex((item) => record.key === item.key);
  //     if (index > -1) {
  //       const item = newData[index];
  //       await EditItem(item.ID, record.Title, record.URL);
  //       handleFetchData();
  //       setEditingKey('');
  //     }
  //   } catch (error) {
  //     console.error("Error saving item:", error);
  //   }
  // };

  const handleSave = async (record: any) => {
    try {
      const newData = [...fetchedData];
      const index = newData.findIndex((item) => record.ID === item.ID);
  
      if (index > -1) {
        const editedItem = await editForm.validateFields(); // Validate the form fields
  
        // Assuming `record.ID` is the SharePoint item ID
        await EditItem(record.ID, editedItem.Title, editedItem.URL); // Update the SharePoint list
  
        newData.splice(index, 1, { ...record, Title: editedItem.Title, URL: editedItem.URL });
        setFetchedData(newData);
        setEditingKey('');
      }
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };  
  
  

  const columns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: 'Title',
      dataIndex: 'Title',
      key: 'Title',
      editable: true,
      render: (text:string, record:Item) => {
        const editable = isEditing(record);
  
        return editable  ? (
          <Form.Item name="Title" style={{ margin: 0 }}>
            <Input />
          </Form.Item>
        ) : (
          <span>{record.Title}</span>
        );
      },

    },
    {
      title: 'URL',
      dataIndex: 'URL',
      key: 'URL',
      editable: true,
      render: (text: string, record: Item) => {
        const editable = isEditing(record);
  
        return editable  ? (
          <Form.Item name="URL" style={{ margin: 0 }}>
            <Input />
          </Form.Item>
        ) : (
          <span>{record.URL}</span>
        );
      },

    },
    {
      title: 'Image',
      dataIndex: 'AttachmentFiles',
      key: 'Image',
      editable: true,
      render: (AttachmentFiles:any, record) => {
        const editable = isEditing(record);
 
        return editable  ? (
          <Form.Item  label="Icon">
                              <Upload
                                customRequest={() => { }}
                                showUploadList={true}
                                beforeUpload={(file) => {
                                  // Perform any validation or checks on the file before setting it
                                  handleFileChange({ target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>);
                                  return false; // Prevent automatic upload
                                }}
                              >
                                <Button icon={<UploadOutlined rev={undefined} />}>Upload</Button>
                              </Upload>
                            </Form.Item>
        ) : (
          
          <span><img
          src={record.AttachmentFiles && record.AttachmentFiles.length > 0 ? record.AttachmentFiles[0].ServerRelativePath.DecodedUrl : ''}
          alt="Image"
          style={{ maxWidth: '50px', maxHeight: '50px' }}
        />
        </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_:any, record:Item) => {
        const isEditingRow = isEditing(record);
  
        return isEditingRow  ? (
          <Space size="middle">
            <Button
              type="primary"
              onClick={() => handleSave(record)}
            >
              Save
            </Button>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <Button>Cancel</Button>
            </Popconfirm>
          </Space>
        ) : (
          <Space size="middle">
            <Button disabled={editingKey !== ""} onClick={() => edit(record)} >
              Edit
            </Button>
            <Button onClick={() => handleDelete(record)}>Delete</Button>
          </Space>
        );
      },
    },
  ];

  

  const handleAddData = async () => {
    try {
      await Adding(title, image, url, userEmail);

      setTitle("");
      setImage(null);
      setUrl("");

      if (fileInputRef.current) {
        fileInputRef.current.handleReset();
      }

      await handleFetchData();
      message.success("Data added successfully!");



    } catch (error) {
      console.error("Error adding data:", error);
      message.error("Error adding data. Please try again.");

    }
  };


  const handleFetchData = async () => {
    try {
      const email = props.context.pageContext.user.email;

      // Fetch data from SharePoint
      const data: any = await Fetch(email);

      // Log the fetched data to the console
      console.log(data);

      // Update the state variable with the fetched data
      // setFetchedData(data);
      setFetchedData(data.map((item: any, index: number) => ({ ...item, key: index.toString() })));

    } catch (error) {
      console.error("Error Fetching data:", error);
      // Handle error or display a message to the user
    }
  };


  const onClickEditButton = (index: number) => {
    const newIsOpenArray = [...isOpenArray];
    newIsOpenArray[index] = true;
    setIsOpenArray(newIsOpenArray);
    setOpen(true); // Set the 'open' state to true when the edit button is clicked

  };



  const handleCardClick = (url: string) => {
    window.open(url, "_blank"); // Open the URL in a new tab

    // Use window.location.href to navigate to the URL in the same window
    // window.location.href = itemUrl;

  };


  const customStyle = `:where(.css-dev-only-do-not-override-1uweeqc).ant-carousel .slick-dots li.slick-active button {
    // background-color: #ea881a !important;
    background: #335CCC !important;
    height: 5px !important;
   }

   :where(.css-dev-only-do-not-override-1uweeqc).ant-carousel .slick-dots li {
    position: relative;
    display: inline-block;
    flex: 0 1 auto;
    box-sizing: content-box;
    width: 46px;
    height: 5px;
    margin-inline: 4px;
    padding: 0;
    text-align: center;
    text-indent: -999px;
    vertical-align: top;
    transition: all 0.3s;
    margin-right: 8px;
}
:where(.css-dev-only-do-not-override-1uweeqc).ant-carousel .slick-dots-bottom {
  position: relative;
  top: 60px;
}

:where(.css-dev-only-do-not-override-1uweeqc).ant-carousel .slick-dots li.slick-active {
  width: 46px;
}

:where(.css-1uweeqc).ant-carousel .slick-dots li.slick-active {
  width: 46px;
}

:where(.css-dev-only-do-not-override-1uweeqc).ant-carousel .slick-dots li button {
  position: relative;
  display: block;
  width: 46px;
  height: 5px;
  padding: 0;
  color: transparent;
  font-size: 0;
  background: #ffffff;
  border: 0;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  opacity: 0.3;
  transition: all 0.3s;
}

.r1alrhcs {
  width: 30px !important;
  align-items: center;
  box-sizing: border-box;
  display: inline-flex;
  justify-content: center;
  text-decoration-line: none;
  vertical-align: middle;
  margin: 0px;
  overflow: hidden;
  background-color: #3A86FF30;
  color: var(--colorNeutralForeground1);
  border: none;
  font-family: var(--fontFamilyBase);
  outline-style: none;
  min-width: 18px;
  height: 24px;
  border-radius: var(--borderRadiusMedium);
  font-size: var(--fontSizeBase300);
  font-weight: var(--fontWeightSemibold);
  line-height: var(--lineHeightBase300);
  transition-duration: var(--durationFaster);
  transition-property: background, border, color;
  transition-timing-function: var(--curveEasyEase);
}
`;
  const chunkArray = (array: any[], size: number) => {
    const chunkedArr: any = [];
    let index = 0;
    while (index < array.length) {
      chunkedArr.push(array.slice(index, size + index));
      index += size;
    }
    return chunkedArr;
  };

  const chunkSize = 4;

  // const handleEdit = async (item: any) => {
  //   try {
  //     await EditItem(item.ID, title, url);
  //     handleFetchData(); // Refresh data after editing
  //     onCloseDrawer(0); // Close the drawer after editing
  //   } catch (error) {
  //     console.error("Error editing item:", error);
  //   }
  // };

  const handleEdit = async (item: any) => {
    // Extract details from the selected item
    const { Title, URL} = item;

    // Set the extracted details to the state
    setTitle(Title);
    setUrl(URL);

    try {
      
      // Assuming EditItem function needs a unique identifier, update this line accordingly
      await EditItem(item.ID, title, url);

      // Refresh data after editing
      handleFetchData();

  
    } catch (error) {
      console.error("Error editing item:", error);
    }
  };


  const handleDelete = async (item: any) => {
    console.log("Item before deletion:", item);

    try {
      const itemId = item.ID; // Assuming the ID is stored in a column named "ID"

      if (itemId) {
        console.log("Deleting item with ID:", itemId);

        await DeleteItem(itemId);
        handleFetchData(); // Refresh data after deleting
        // onCloseDrawer(0); // Close the drawer after deleting
      } else {
        console.error("Item ID is undefined or null.");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };





  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    console.log('Selected File:', selectedFile);
    setImage(selectedFile);

  };


  return (
    <div>
      <style>{customStyle}</style>
      <div className={styles.container}>
        <div className={styles.child}></div>
        <div className={styles.child2}></div>

        {fetchedData.length ? (
          <Fragment >

            <Button onClick={() => slider.current.prev()} className={styles.nextArrow}>{`<`}</Button>

            <Carousel autoplay  autoplaySpeed={5000} ref={slider} dots={true}>
              {chunkArray(fetchedData, chunkSize).map((chunk: any[], chunkIndex: number) => (
                <div key={chunkIndex} className={styles.textStyle}>

                  <div
                    className={styles.Elevatedivstyle}
                  >
                    <div style={{ flexBasis: "2%" }}>

                      <Button onClick={() => onClickEditButton(chunkIndex)}>
                        <img
                          src={require("../assets/Edit.svg")}
                          alt="Edit button"
                        />
                      </Button>
                      <Drawer title="Add content" onClose={onClose} open={open} width={700}>
                        <div>
                          <Form onFinish={handleAddData}>



                            <Form.Item label="Title">
                              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                            </Form.Item>



                            <Form.Item label="URL">
                              <Input value={url} onChange={(e) => setUrl(e.target.value)} />
                            </Form.Item>


                            <Form.Item label="Icon">
                              <Upload
                                customRequest={() => { }}
                                showUploadList={true}
                                beforeUpload={(file) => {
                                  // Perform any validation or checks on the file before setting it
                                  handleFileChange({ target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>);
                                  return false; // Prevent automatic upload
                                }}
                              >
                                <Button icon={<UploadOutlined rev={undefined} />}>Upload</Button>
                              </Upload>
                            </Form.Item>
                            <Form.Item>


                              <Button type="primary" htmlType="submit" style={{ marginLeft: "42px" }}>Add</Button>
                            </Form.Item>

                          </Form>
                        </div>

                        <div>
                          <h4 className={styles.ManageText}>Add content</h4>
                          <Form form={editForm} component={false}>
                          <Table columns={columns} pagination={false} dataSource={fetchedData} rowKey="key">
                            {fetchedData.map((item: any, index: number) => (
                              <div key={index}>
                                <span>{item.Title}</span>
                                <span>{item.URL}</span>
                                {item.AttachmentFiles.map((attachment: any, attachmentIndex: number) => (
                                  <span key={attachmentIndex}>
                                    <img src={attachment.ServerRelativePath.DecodedUrl} alt={item.Title} className={styles.Imageedit} style={{ paddingRight: "20px" }} />
                                  </span>
                                ))}
                                <Button onClick={() => handleEdit(item)}>Edit</Button>
                                <Button onClick={() => handleDelete(item)}>Delete</Button>
                              </div>
                            ))}
                              
                      <Button type="primary">Submit</Button>
                          </Table>
                          </Form>
                        </div>

                      </Drawer>
                    </div>
                    <p
                      className={styles.ElevateText}
                    >
                      Elevate Your
                    </p>
                    <p
                      className={styles.ProductivityText}
                    >
                      Productivity to New Heights
                    </p>
                  </div>

                  <div className={styles.carddiv}>
                    <div className={styles.cardContainer}>
                      {/* {chunk.map((item: any, index: number) => (
                        <div key={index} className={styles.card} onClick={() => handleCardClick(item.URL)}>
                          <p>
                            <img src={item.AttachmentFiles[0].ServerRelativePath.DecodedUrl} alt={item.Title} className={styles.Imageedit} />
                          </p>
                          <p className={styles.cardText}>{item.Title}</p>
                        </div>
                      ))} */}
                      {chunk.map((item: any, index: number) => (
                        <div key={index} className={styles.card} onClick={() => handleCardClick(item.URL)}>
                          {item.AttachmentFiles.map((attachment: any, attachmentIndex: number) => (
                            <p key={attachmentIndex}><img src={attachment.ServerRelativePath.DecodedUrl} alt={item.Title} className={styles.Imageedit} /></p>
                          ))}
                          <p className={styles.cardText}>{item.Title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
            <Button onClick={() => slider.current.next()} className={styles.prevArrow}>{`>`}</Button>
          </Fragment >

        ) : (
          <div className={styles.NoDataedit}>

            {/* <Button onClick={() => onClickEditButton(0)}>
              <img src={require("../assets/Edit.svg")} alt="Edit button" />
            </Button> */}
            <Button onClick={onClickEditButton}>
              <img
                src={require("../assets/Edit.svg")}
                alt="Edit button"
              />
            </Button>
            <Drawer title="Add content" onClose={onClose} open={open} width={600}>
              <div>
              <div>
                          <Form onFinish={handleAddData}>



                            <Form.Item label="Title">
                              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                            </Form.Item>



                            <Form.Item label="URL">
                              <Input value={url} onChange={(e) => setUrl(e.target.value)} />
                            </Form.Item>


                            <Form.Item label="Icon">
                              <Upload
                                customRequest={() => { }}
                                showUploadList={true}
                                beforeUpload={(file) => {
                                  // Perform any validation or checks on the file before setting it
                                  handleFileChange({ target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>);
                                  return false; // Prevent automatic upload
                                }}
                              >
                                <Button icon={<UploadOutlined rev={undefined} />}>Upload</Button>
                              </Upload>
                            </Form.Item>
                           
                            <Form.Item>
                              <Button type="primary" htmlType="submit" style={{ marginLeft: "42px" }}>Add</Button>
                            </Form.Item>

                          </Form>
                        </div>
                      </div>

            </Drawer>
            <h1>No Data to show!!</h1>
          </div>
        )}
      </div>
    </div>
  );
}


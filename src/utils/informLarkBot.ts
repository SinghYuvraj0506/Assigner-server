import axios from "axios";

const informLarkBot = async (
  url: string,
  headerText: string,
  divsArray: string[]
) => {
  if (process.env.NODE_ENV === "development") {
    // stops lark bot in development server
    console.log("Stopping Lark");
    return true;
  }

  const response = await axios.post(url, {
    msg_type: "interactive",
    card: {
      config: {
        wide_screen_mode: true,
        enable_forward: true,
      },
      header: {
        title: {
          content: headerText,
          tag: "plain_text",
        },
      },
      elements: divsArray.map((e, i) => {
        return {
          tag: "div",
          text: {
            content: e,
            tag: "lark_md",
          },
        };
      }),
    },
  });

  const json = response.data;
  return json.StatusMessage;
};

export default informLarkBot;
